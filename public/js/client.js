(function (window) {
	//Set the number of tanks to pre allocate.
	var TANK_BUFFER = 1;

 	var tankBody = new Image();
	tankBody.src = 'http://54.218.14.138/images/tank.png';
	var tankTurret = new Image();
	tankTurret.src = 'http://54.218.14.138/images/turret.png';
	//Record the current key presses
	var keyMap;
	//The socket connection to the server
	var socket;
	var tanks;

	var Tank = function () {
		var x = 0;
		var y = -100;
	 	var rotation = 180;
	 	var turretRotation = 0;
	 	var canvas = document.createElement("canvas");
	 	var ctx = canvas.getContext('2d');
	 	var color = '#'+Math.floor(Math.random()*16777215).toString(16);
	 	//Set up the canvas
	 	canvas.width = 75;
		canvas.height = 75;
		canvas.style.position = 'absolute';
		canvas.style.zIndex = '1000000';
		canvas.style.top = x + 'px';
		canvas.style.left = y + 'px';
		document.body.appendChild(canvas);

	 	function draw() {
	 		ctx.save();
	 		ctx.clearRect(0, 0, canvas.width, canvas.height);
	 		ctx.translate(canvas.width / 2, canvas.height / 2);

			ctx.fillStyle= color;
			ctx.beginPath();
			ctx.arc(0, 0, 18, 0, Math.PI*2, true); 
			ctx.closePath();
			ctx.fill();

	 		ctx.rotate(rotation * Math.PI/180);
	 		ctx.drawImage(tankBody, -(tankBody.width / 2), -(tankBody.height / 2));
	 		

	 		ctx.rotate(turretRotation * Math.PI/180);
			ctx.drawImage(tankTurret, -(tankTurret.width / 2), -(tankTurret.height * 2 / 3));
	 		
	 		ctx.restore();
	 		canvas.style.left = x + 'px';
	 		canvas.style.top = y + 'px';
	 	};

	 	function update(newX, newY, newRotation, newTRotation) {
	 		x = newX;
	 		y = newY;
	 		rotation = newRotation;
	 		turretRotation = newTRotation;
	 		draw();
	 	};

	 	function hide() {
	 		//Move the canvas off the sceen;
	 		y = -100;
	 		draw();
	 	};

	 	function remove() {
	 		canvas.parentNode.removeChild(canvas);
	 	};

	 	return {
	 		update : update,
	 		remove: remove,
	 		hide: hide,
	 	};
	};

	var init = function () {
		window.INGAME_WEBTANKZ = true;
		tanks = [];
		for (var i = 0; i < TANK_BUFFER; i++) {
			tanks.push(new Tank());
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
			socket = io.connect("http://54.218.14.138", {port: 8124, transports: ["websocket"]});
			socket.on("connect", onSocketConnected);
			socket.on("update", update);
		}

	}

	function onSocketConnected() {
		console.log("Connected to socket server");
		socket.emit("new player", {x: 100, y: 100});
	};

	function update(data) {
		//If there are more players than allocated sprites then create more
		while (data.length > tanks.length) {
			console.log("Not Enough sprites, adding one more");
			tanks.push(new Tank());
		}
		//Move all the sprites.
		for (var i = 0; i < data.length; i++) {
			var player = data[i];
			tanks[i].update(player.x, player.y, player.rotation, player.turretRotation);
		}
		//Hide the unsued sprites.
		for (var i = data.length; i < tanks.length; i++) {
			tanks[i].hide();
		}
	};

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
