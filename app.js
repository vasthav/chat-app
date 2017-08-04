// source : https://github.com/mmukhin/psitsmike_example_1/blob/master/app.js

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);
console.log("Server running ... ");
// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var onlineClients = {};

io.sockets.on('connection', function (socket) {

  // when the client emits 'sendchat', this listens and executes
  socket.on('sendchat', function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    io.sockets.emit('updatechat', socket.username, data);
  });

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username){
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    // onlineClients[username] = socket.id;
    onlineClients[username] = socket.id;
    // echo to client they've connected
    socket.emit('updatechat', 'SERVER : ', username+' \n');
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('updatechat', 'SERVER : ', username + ' has connected\n');
    // update the list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
  });

  //private message
  socket.on('privatemsg', function(to, message) {
    var id = onlineClients[to];
    // io.sockets.socket(id).emit('privatechat', socket.username, message);
  	socket.to(id).emit('privatechat', socket.username, message);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    // socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });
});