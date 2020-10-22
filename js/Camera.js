function Camera()
{
	this.x = 0;
	this.y = 0;
	this.angle = 1.5708;
	
	this.lastX = -1;
	this.lastY = -1;
	this.lastAngle = 0;
}

Camera.prototype.moved = function()
{
	// Determine if the player moved
	if(this.lastX == this.x && this.lastY == this.y && this.lastAngle == this.angle)
	{
		return false;
	}
	
	this.lastX = this.x;
	this.lastY = this.y;
	this.lastAngle = this.angle;
	
	return true;
};	