function Ball()
{
	this.item_id = 6;
	this.scale = 0.5;
	this.x = 0.0;	//this.camera.x + 5;
	this.y = 0.0;	//this.camera.y;
	this.z = 0.0;
		
	this.velocity = {	// All in meters per second
		x: 0.0,
		y: 0.0,
		z: 0.0
	};
}

Ball.prototype.updateBallPos = function(elapsed_seconds)
{
	var drag = 0.98;
	
	// Move the ball according to it's velocity
	this.x += this.velocity.x * elapsed_seconds;
	this.y += this.velocity.y * elapsed_seconds;
	this.z += this.velocity.z * elapsed_seconds;

	if (this.z <= 0)
	{
		// Stop the ball from falling below the ground
		this.z = 0;

		//  TODO:  Add bounce code.  If velocity is greater than X, then bounce with half force
		// TODO: Also chck what we're bouncing on
		this.velocity.z = Math.abs(this.velocity.z);
		if(this.velocity.z > 4)
		{
			// Let it bounce
			this.velocity.z *= 0.4;
		}
		else
		{
			this.velocity.z = 0;

			// Increase the drag, ball rolls slower on ground
			drag += 1.2;
		}
	}
	else
	{
		// Ball in flight
		// Apply drop due to gravity
		this.velocity.z -= 9.8 * elapsed_seconds;
	}

	// Apply drag
	this.velocity.x -= this.velocity.x * drag * elapsed_seconds;
	this.velocity.y -= this.velocity.y * drag * elapsed_seconds;
};
