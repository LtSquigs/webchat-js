
/* 
*	Web Chat Library
*  
*	Simple library based on socket.io that abstracts away the messages and exposes callbacks to implement a 
*	webchat on top of.
*
*	Members:
*		serverName: String, Address of webchat server to connect to.
*		userName: String, The username of the user that is connecting to chat.
*		debug: Boolea,n Turn debug console messages on/off.
*
*	Methods:
*		connectToChat(): Connects the client to the webchat server specified by serverName.
*		sendMessage(message): Sends a message to the chat server (which is then broadcasted to all clients).
*		disconnect(): Disconnects from the chat server.
*
*	Callbacks:
*		onConnect(): Called when the connection to the chat server has been established.
*		onUserList(userList): Called after connection and userList is sent to client, userList is an array of users already connected.
*		onJoin(userName): Called when a user has joined the web chat, userName is the user joining.
*		onMessage(userName, message): Called when the client recieves a chat message. userName is the sender, message is the actual message.
*		onError(message): Called when the server sends an error message. 
*		onPart(userName): Called when a user leaves the chat, userName is the name of the user that left.
*		onDisconnect(): Called when this websocket has been disconnected from the server (either the server goes down, or the disconnect method was called).
*
*
*	Notes:
*		- If a callback isn't specified a default empty callback will take its place.
*		- sendMessage and disconnect will both silently fail if the client is not connected (with logs if debug is on).
*		- A history of recent messages are sent when a client first connects to the chat server, so the 10 last messages are sent to onMessage on connect.
*/ 

var chatLib = new function() {

	this.onConnect = function() {};
	this.onJoin = function(userName) {};

	this.onUserList = function(userList) {};

	this.onMessage = function(userName, message) {};
	this.onError = function(message) {};

	this.onPart = function(userName) {};
	this.onDisconnect = function() {};

	this.serverName = 'localhost';

	this.userName = 'Anony';

	this.debug = false;

	this._connected = false;

	this.log = function(msg)
	{
		if(this.debug)
			console.log(msg);
	}

	this.connectToChat = function() {

		var parent = this;

		var serverName = this.serverName;
		var onMessage = this.onMessage;
		var onError = this.onError;
		var onConnect = this.onConnect;
		var onDisconnect = this.onDisconnect;
		var onJoin = this.onJoin;
		var onPart = this.onPart;
		var onUserList = this.onUserList;

		this.chat = io.connect('http://' + serverName + '/chat');

		this.chat.on('connect', function () {
			parent.log('Connected to chat server');
			parent.chat.emit('join', { name: parent.userName });

			parent._connected = true;

			onConnect();
		});

		this.chat.on('history', function(data) {
			parent.log('Recieved historic message data');
			for(var i = 0; i < data.history.length; i++)
			{
				var msg = data.history[i];
				onMessage(msg.userName, msg.text);
			}
		});

		this.chat.on('user-list', function (data) {
			var userList = data.userList;

			onUserList(userList);
		});

		this.chat.on('join', function(data) {
			parent.log('User Joined: ' + data.userName ); 
			onJoin(data.userName, data.timeStamp);
		});

		this.chat.on('message', function(data) {
			parent.log('Recieved Message: ' + data.userName + ' : ' + data.text); 
			onMessage(data.userName, data.text, data.timeStamp);
		});

		this.chat.on('error', function(data) {
			parent.log('Recieved Error: ' + data.text);
			onError(data.text, data.timeStamp);
		});

		this.chat.on('part', function(data) {
			onPart(data.userName, data.timeStamp);
		});

		this.chat.on('disconnect', function () {
			parent.log('Disconnected from chat server.');
			parent.chat.emit('part', { name: parent.userName });

			parent._connected = false;

			onDisconnect();
		});
	};

	this.sendMessage = function(message) {
		// Send message to server
		if(!this._connected)
		{
			this.log('Cannot send message, chat has not been connected to yet.');
			return;
		}

		this.chat.emit('message', { text: message });
	};

	this.disconnect = function() {
		if(!this._connected)
		{
			this.log('Cannot disconnect, chat has not been connected to yet.');
			return;
		}

		this.chat.disconnect();
	}
};