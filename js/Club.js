var IN_PER_M = 39.3701;
function deg2rad(angle) { return angle * 0.017453292519943295; }

function Club(clubName, loftAngle, lengthInches)
{
	this.name = clubName;
	this.angle = loftAngle;
	this.length = lengthInches / IN_PER_M;
}

Club.prototype.swing = function(power, heading)
{
	// Calculate the swing force based on the club length and power
	var force = power * 0.5;	// TODO: Convert percentage to actual force in a better way
	
	// Vector the vertical (Z) portion of the force based on the angle
	var sin_z = Math.sin(deg2rad(this.angle));

	// Some of the force is used to loft the ball
	var remainingForce = (1 - sin_z) * force;
	
	// Vector the forces
	var sin_r = Math.sin(heading);
	var cos_r = Math.cos(heading);

	// Return the Vector3	
	var velocity = {
		x: sin_r * remainingForce,
		y: cos_r * remainingForce,
		z: sin_z * force
	};
	
	return velocity;
};