var app = require('express').createServer()
var io = require('socket.io').listen(app);

app.listen(8080);

// Routing the index file
app.get('/', function(req, res){
	res.sendfile(__dirname+'/index.html');
});

var usernames = {};

io.sockets.on('connection', function(socket){
	socket.on('sendchat', function(data){
		io.sockets.emit('updatechat', socket.username, data);
	});

	socket.on('adduser', function(username){
		socket.username = username;
		usernames[username] = username;
		// update user that they have connected.
		socket.emit('updatechat', 'SERVER', 'connected...')
		// update the list of users
		io.sockets.emit('updateusers', usernames);
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});

});