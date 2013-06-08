
var util = require("util"),
	io = require("socket.io"),
 	Player = require('./player').Player,
	Shot = require('./shot').Shot,
	socket,
	players,
	shots,
	instance;

function init() {
	players = [];
	shots = [];
	socket = io.listen(8124);
	socket.configure(function() {
    	socket.set("transports", ["websocket"]);
    	socket.set("log level", 2);
	});
	socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
	util.log("New Player Connected: " + client.id);
	client.on('disconnect', onClientDisconnect);
	client.on('new player', onClientConnect);
	client.on('update keys', updatePressedKeys);
};

function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);
    var removePlayer = playerById(this.id);
	if (!removePlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};
	players.splice(players.indexOf(removePlayer), 1);
	//All the players have disconnected stoping broadcasts
	if (players.length == 0) {
		util.log("Last Player disconnected stopping game");
		clearInterval(instance);
	}
};

function onClientConnect(data) {
	var newPlayer = new Player(data.x, data.y, 0, 0, this.id);
	util.log("Player Connected");
	players.push(newPlayer);
	//There are players on the server to start broadcasting locations
	if (players.length == 1) {
		util.log("First Player connected starting game");
		instance = setInterval(broadcastPlayerData, 60);
	}
};

function broadcastPlayerData() {
	var locations = [],
		i;
	for (i = 0; i < players.length; i++) {
		var player = players[i];
		player.update();
		locations.push(player.getPosition());
	}
	socket.sockets.emit("update", locations);
};

function updatePressedKeys(data) {
	var player = playerById(this.id);
	// Player not found
	if (!player) {
		util.log("Player not found: " + this.id);
		return;
	};
	// Update player position
	player.updateKeyMap(data);
};

function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].getId() == id)
            return players[i];
    };
    return false;
};

init();