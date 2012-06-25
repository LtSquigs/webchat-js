Web Chat Client Library/Node Server
==============================================================

This is a client library and node server that can be used to easily implement a web chat. It is built on top of socket.io so it will use the most effecient transport available on the client to implement the webchat.

Installation
------------

### Server

In order to install the server first install the `socket.io` library:

	npm install socket.io

Then download the webchat-server.js file from this repository onto the server you wish to run the webchat server on.

### Client

To install the client download the chatLib.js file from this repository and add the following scripts to your client page:

```js
	<script src="http://<webchat-server-location>/socket.io/socket.io.js"></script>
	<script src="chatLib.js"></script>
```

Usage
------------

### Server

First configure the webchat server by changing the port and maxHistory settings in the file, then run it using the following command:

	node webchat-server.js

### Client

In order to use the client library first set the serverName and userName properties of the client, and assign callbacks to the functions you want handled, then call connectToChat()

```js
	chatLib.onMessage = function(message) { ... };
	chatLib.onJoin = function(userName) { ... };

	chatLib.serverName = '<webchat-server-location>';
	chatLib.userName = '<userNameHere>';

	chatLib.connectToChat();
```

Example
-----------

Heres a quick example showing how to use the chatLib client library to join a chat, send a message, and echo all messages recieved to the console.

```js
	chatLib.onConnect = function() { chatLib.sendMessage('Whats up my dodge?'); };
	chatLib.onMessage = function(message) { console.log(message); };

	chatLib.serverName = 'localhost:8080';
	chatLib.userName = 'Me';

	chatLib.connectToChat();
```

This example assumes the server is running on the localhost at port 8080.