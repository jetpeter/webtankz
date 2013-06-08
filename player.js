
var Player = function(startX, startY, rotation, turretRotation, id) {
	var SPEED = 5;
	var ROTATION_RATE = 8;
	var x = startX,
		y = startY,
		rotation = rotation,
		turretRotation = turretRotation,
		id,
		keyMap = {
			"up" : false,
			"down": false,
			"left": false,
			"right" : false,
			"shift" : false,
		};

	function updateKeyMap(newKeyMap) {
		keyMap = newKeyMap;
	}

	function update() {
 		if (keyMap.up || keyMap.down) {
 			if (!keyMap.shift) {
 				updateRotation();
 			}
 			updatePosition(keyMap.up ? 1 : -1);
 		}
 		if (keyMap.left) {
 			updateTurret(false);
 		}

 		if (keyMap.right) {
 			updateTurret(true);
 		}	
	}

 	function getPosition() {
 		return {
 			'id': id,
 			'x': x,
 			'y': y,
 			'rotation': rotation,
 			'turretRotation': turretRotation,
 		};
 	}

	function getId() {
		return id;
	}


	function updateRotation() {
 		if (turretRotation == 0 || turretRotation == 360) {
 			return;
 		}
 		if (turretRotation > 180) {
 			turretRotation = rotateRight(turretRotation);
 			rotation = rotateLeft(rotation);
 		} else {
 			turretRotation = rotateLeft(turretRotation);
	 		rotation = rotateRight(rotation);
 		}
 	}

 	function updatePosition(directionMultiplier) {
        y += directionMultiplier * -SPEED * Math.cos(rotation * Math.PI/180);
        x += directionMultiplier * SPEED * Math.sin(rotation *  Math.PI/180);
 	}

 	function updateTurret(right) {
 		if (right) {
 			turretRotation = rotateRight(turretRotation);
 		} else {
 			turretRotation = rotateLeft(turretRotation);
 		}
 	}

 	function rotateLeft(current) {
 		if (current <= 0) {
 			current += 360;
 		} else {
 			current -= ROTATION_RATE;
 		}
 		return current;
 	}

 	function rotateRight(current) {
 		if (current >= 360) {
 			current -= 360;
 		} else {
 			current += ROTATION_RATE;
 		}
 		return current;
 	}


	return {
		update: update,
		getPosition: getPosition,
		getId: getId,
		updateKeyMap: updateKeyMap,
	}
}

exports.Player = Player;