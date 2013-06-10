var Shot = function(startX, startY, rotation) {
	var MAX_AGE = 40;
	var SPEED  = 20;
	var x = startX;
	var y = startY;
	var rotation = rotation;
   	var age = 0;
 	
   	function getPosition() {
 		return {
 			'x': x,
 			'y': y,
 			'rotation': rotation,
 		};
   	}

   	function updatePosition() {
	    y += -SPEED * Math.cos(rotation * Math.PI/180);
	    x += SPEED * Math.sin(rotation *  Math.PI/180);
	    age++;
 	}

 	function isOverMaxAge() {
 		return age > MAX_AGE;
 	}

 	return {
 		getPosition: getPosition,
 		updatePosition: updatePosition,
 		isOverMaxAge: isOverMaxAge,
 	};

}

exports.Shot = Shot;