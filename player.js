var Player = function(startX, startY, rotation, turretRotation, id) {
    var SPEED = 20;
    var ROTATION_RATE = 20;
    var SHOT_DELAY = 30;

    var x = startX,
        y = startY,
        rotation = rotation,
        turretRotation = turretRotation,
        id,
        lastShot = 0,
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
        lastShot--;
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

    function getPositionForShot() {
        if (lastShot <= 0) {
            lastShot = SHOT_DELAY;
            return getPosition();
        } else {
            return false;
        }
    }

    function getId() {
        return id;
    }


    function updateRotation() {
	var sinR = Math.sin(turretRotation * Math.PI/180);
	var cosR = Math.cos(turretRotation * Math.PI/180);
        //Check if the position is very close to 0
        //I cant use == because Math.sin will often return something
        //like -2.4e-16 :/
        if (cosR == 1) {
            return;
        }
        if (sinR < 0) {
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
        return current - ROTATION_RATE;
    }

    function rotateRight(current) {
        return current + ROTATION_RATE;
    }

    return {
        update: update,
        getPosition: getPosition,
        getId: getId,
        updateKeyMap: updateKeyMap,
        getPositionForShot: getPositionForShot,
    }
}

exports.Player = Player;
