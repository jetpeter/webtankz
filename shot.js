var Shot = function(startX, startY, rotation) {
	var SPEED  = 10;
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
 	}

 	return {
 		getPosition: getPosition,
 		updatePosition: updatePosition,
 	};

}

exports.Shot = Shot;