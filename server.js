
var REFRESH_RATE = 100;

var util = require("util"),
    io = require("socket.io")(8124),
    Player = require('./player').Player,
    Shot = require('./shot').Shot,
    players,
    shots,
    instance;

function init() {
    players = [];
    shots = [];
    io.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New Player Connected: " + client.id);
    client.on('disconnect', onClientDisconnect);
    client.on('new player', onClientConnect);
    client.on('update keys', updatePressedKeys);
    //client.on('fire shot', newShot);
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
        instance = setInterval(broadcastPlayerData, REFRESH_RATE);
    };
};

function broadcastPlayerData() {
    var locations = [],
        shotLocations = [],
        i;
    for (i = 0; i < shots.length; i++) {
        var shot = shots[i];
        if (shot.isOverMaxAge()) {
            shots.splice(i, 1);
        } else {
            shot.updatePosition();
            detectShotCollision(shot);
            shotLocations.push(shot.getPosition());
        }
    };
    for (i = 0; i < players.length; i++) {
        var player = players[i];
        player.update();
        locations.push(player.getPosition());
    };
    io.emit("update", {"playerLocations": locations, "shotLocations": shotLocations});
};

function detectShotCollision(shot) {
    for (i = 0; i < players.length; i++) {
        //player.hasCollided(shot);
        //players.splice(i, 1);
    };
}

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

function newShot(data) {
    var player = playerById(this.id);
    var pos = player.getPositionForShot();
    //Only add the shot if the player is allowed to take a shot
    if (pos) {
        shots.push(new Shot(pos.x, pos.y, pos.turretRotation + pos.rotation));
    }
}

function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].getId() == id)
            return players[i];
    }
    return false;
}

init();
