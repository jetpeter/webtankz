(function (window) {
    //Set the number of tanks to pre allocate.
    var TANK_BUFFER = 1;
    var SHOT_BUFFER = 10;

    var tankBody = new Image();
    tankBody.src = 'http://dodgecube.com/webtankz/images/tank.png';
    var tankTurret = new Image();
    tankTurret.src = 'http://dodgecube.com/webtankz/images/turret.png';
    //Record the current key presses
    var keyMap;
    //The socket connection to the server
    var socket;
    var tanks;
    var shots;

    var Tank = function () {
            //How often the screen is redrawn
        var UPDATE_INTERVOL = 11,
            //How many times we are expecting to draw between server updades
            UPDATE_SPLIT = 11,
            x = 0,
            y = -100,
            rotation = 0,
            turretRotation = 0,
            xWaypoint = x,
            yWaypoint = y,
            rotationIntervol = 0,
            turretRotationIntervol = 0,
            canvas = document.createElement("canvas"),
            ctx = canvas.getContext('2d'),
            color = '#'+Math.floor(Math.random()*16777215).toString(16),
            updater,
            hidden = true;

        //Set up the canvas
        canvas.width = 60;
        canvas.height = 60;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1000000';
        canvas.style.top = x + 'px';
        canvas.style.left = y + 'px';
        document.body.appendChild(canvas);

        function updateLocation() {
            x += (xWaypoint - x) / UPDATE_SPLIT;
            y += (yWaypoint - y) / UPDATE_SPLIT;
            moveCanvas();
            //Dont bother redrawing the rotation in the canvas if there is nothing to rotate.
            if (Math.floor(rotationIntervol) != 0 || Math.floor(turretRotationIntervol) != 0) {
                rotation += rotationIntervol;
                turretRotation += turretRotationIntervol;
                drawRotation();
            }
        }

        function moveCanvas() {
            var xOffset = x - 6 - tankBody.width / 2;
            var yOffset = y - tankBody.height / 2;
            canvas.style.left = xOffset + 'px';
            canvas.style.top = yOffset + 'px';
        }

        function drawRotation() {
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fill();
            ctx.rotate(rotation * Math.PI/180);
            ctx.drawImage(tankBody, -(tankBody.width / 2), -(tankBody.height / 2));
            ctx.rotate(turretRotation * Math.PI/180);
            ctx.drawImage(tankTurret, -(tankTurret.width / 2), -(tankTurret.height * 2 / 3));
            ctx.restore();
        }

        function update(newX, newY, newRotation, newTRotation) {
            xWaypoint = newX;
            yWaypoint = newY;
            rotationIntervol = getRotationIntervol(newRotation, rotation);
            turretRotationIntervol = getRotationIntervol(newTRotation, turretRotation);
        }

        function getRotationIntervol(angleOne, angleTwo) {
            var delta = ((angleOne - angleTwo + 180) % 360) - 180;
            var intervol = delta / UPDATE_SPLIT;
            return intervol;
        }

        function hide() {
            //Move the canvas off the sceen;
            y = -100;
            window.clearInterval(updater);
            moveCanvas();
            hidden = true;
        }

        function show(newX, newY) {
            x = newX;
            y = newY;
            updater = setInterval(updateLocation, UPDATE_INTERVOL);
            hidden = false;
            moveCanvas();
            drawRotation();
        }

        function remove() {
            canvas.parentNode.removeChild(canvas);
        }

        function isHidden() {
            return hidden;
        }

        return {
            update : update,
            remove: remove,
            hide: hide,
            isHidden: isHidden,
            show: show,
        };
    };

    var Shot = function () {
        // How long between each draw call
        var UPDATE_INTERVOL = 33;
        //How many times we are expecting to draw between server updades
        var UPDATE_SPLIT = 5;
        var x = 0;
        var y = -100;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');
        var updater;
        var xIntervol = 0;
            yIntervol = 0;
        //Set up the canvas
        canvas.width = 5;
        canvas.height = 5;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1000000';
        canvas.style.top = x + 'px';
        canvas.style.left = y + 'px';
        document.body.appendChild(canvas);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.fillStyle= "#000000";
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        function update(newX, newY) {
            xIntervol = (newX - x) / UPDATE_SPLIT;
            yIntervol = (newY - y) / UPDATE_SPLIT;
        }

        function updateLocation() {
            if (xIntervol != 0 || yIntervol != 0) {
                x += xIntervol;
                y += yIntervol;
                moveCanvas();
            }
        }

        function moveCanvas() {
            canvas.style.left = x + 'px';
            canvas.style.top = y + 'px';
        }

        function hide() {
            //Move the canvas off the sceen;
            window.clearInterval(updater);
            y = -100;
            moveCanvas();
        }

        function show() {
            //Move the canvas onto the screen and set the draw intervol
            updater = setIntervol(updatLocation, UPDATE_INTERVOL)
        }

        function remove() {
            canvas.parentNode.removeChild(canvas);
        }

        return {
            update : update,
            remove: remove,
            hide: hide,
            show: show,
        };
    };

    var init = function () {
        window.INGAME_WEBTANKZ = true;
        tanks = [];
        for (var i = 0; i < TANK_BUFFER; i++) {
            tanks.push(new Tank());
        };
        shots = [];
        for (var i = 0; i < SHOT_BUFFER; i++) {
            shots.push(new Shot());
        };
        keyMap = {
            "up" : false,
            "down": false,
            "left": false,
            "right" : false,
            "shift" : false,
        };
        startSoket();
    };

    var startSoket = function() {
        if (typeof io === 'undefined') {
            //Pause for half a second to make sure IO loads properly.
            window.setTimeout(startSoket, 500);
            console.log("Io Is not Defined");
        } else {
            socket = io.connect("http://dodgecube.com", {port: 8124, transports: ["websocket"]});
            //socket = io.connect("http://localhost", {port: 8124, transports: ["websocket"]});
            socket.on("connect", onSocketConnected);
            socket.on("update", update);
        }
    };

    function onSocketConnected() {
        console.log("Connected to socket server");
        socket.emit("new player", {x: 100, y: 100});
    }

    function update(data) {
        updatePlayers(data.playerLocations);
        updateShots(data.shotLocations);
    }

    function updateShots(shotLocations) {
        //If there are more shots than allocated sprites then create more
        while (shotLocations.length > shots.length) {
            console.log("Not Enough shot sprites, adding one more");
            shots.push(new Shot());
        }
        //Move all the sprites.
        for (var i = 0; i < shotLocations.length; i++) {
            var player = shotLocations[i];
            shots[i].update(player.x, player.y);
        }
        //Hide the unsued sprites.
        for (var i = shotLocations.length; i < shots.length; i++) {
            shots[i].hide();
        }
    }

    function updatePlayers(playerLocations) {
        //If there are more players than allocated sprites then create more
        while (playerLocations.length > tanks.length) {
            console.log("Not Enough player sprites, adding one more");
            tanks.push(new Tank());
        }
        //Move all the sprites.
        for (var i = 0; i < playerLocations.length; i++) {
            var player = playerLocations[i];
            var tank = tanks[i];
            if (tank.isHidden()) {
                tank.show(player.x, player.y);
            }
            tank.update(player.x, player.y, player.rotation, player.turretRotation);
        }
        //Hide the unsued sprites.
        for (var i = playerLocations.length; i < tanks.length; i++) {
            tanks[i].hide();
        }
    }

    function updateKeymap(isDown, event) {
        var shouldUpdate = keyMap.shift != event.shiftKey;
        keyMap.shift = event.shiftKey;
        switch (event.keyCode) {
            case 37: // Left
                shouldUpdate = keyMap.left != isDown;
                keyMap.left = isDown;
                break;
            case 38: // Up
                shouldUpdate = keyMap.up != isDown;
                keyMap.up= isDown;
                break;
            case 39: // Right
                shouldUpdate = keyMap.right != isDown;
                keyMap.right = isDown;
                break;
            case 40: // down
                shouldUpdate = keyMap.down != isDown;
                keyMap.down = isDown;
                break;
        };

        if (event.keyCode == 32) {
            socket.emit("fire shot", {});
        }

        //Allways check for escape. to exit the game
        if (event.keyCode == 27 && window.INGAME_WEBTANKZ) {
            endGame();
            shouldUpdate = false;
        }

        if (shouldUpdate) {
            socket.emit('update keys', keyMap);
        };
    };

    function endGame() {
        socket.disconnect();
        document.onkeydown = null;
        document.onkeyup = null;
        for (var i = 0; i < tanks.length; i++) {
            tanks[i].remove();
        }
        window.INGAME_WEBTANKZ = false;
    }

    //Only Launch a new game if one is not running currently.
    if (!window.INGAME_WEBTANKZ) {
        document.onkeydown = function (e) {
            updateKeymap(true, e);
            return false;
        };
        document.onkeyup = function (e) {
            updateKeymap(false, e);
            return false;
        };
        init();
    }

})(typeof exports != 'undefined' ? exports : window);
