
/*
*	Web Chat Node Server
*
*	Simple server built on socket.io that implements a protocol that the chatLib library can use
*	to create a webchat.	
*/

// Server Options
//================================================================

var port = 8080;
var maxHistory = 10; // Maximum number of messages to keep in history.

//================================================================


var io = require('socket.io').listen(port);

var connectedUsers = [];
var history = [];

var chat = io.of('/chat').on('connection', function(socket) {

	var socketInfo = new function() {
		this.userName = '';
	}

	socket.emit('user-list', { userList : connectedUsers });

	if(history.length > 0)
		socket.emit('history', { history: history });

	socket.on('join', function(data) {
		chat.emit('join', { userName : data.name });
		socketInfo.userName = data.name;
		connectedUsers.push(data.name);
	});

	socket.on('message', function(data) {
		chat.emit('message', { userName: socketInfo.userName, text : data.text});

		history.push( {userName: socketInfo.userName, text: data.text });

		if(history.length > maxHistory)
			history.splice(0, 1);
	})

	socket.on('part', function(data) {
		chat.emit('message', { text : data.name + ' left the chat.'});
	});

	socket.on('disconnect', function(data) {
		chat.emit('part', { userName : socketInfo.userName });

		var idx = connectedUsers.indexOf(socketInfo.userName);
		if(idx != -1) connectedUsers.splice(idx, 1);
	});
});


