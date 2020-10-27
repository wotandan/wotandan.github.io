// Swing meter states:
//	0 - Idle
//	1 - Upswing
//  2 - Downswing

function SwingMeter(callback)
{
	this.doSwing = callback;
	
	this.state = 0;
	this.maxPower = 120;
	this.minPower = -20;
	
	this.position = 0;
	this.power = 0;
	this.accuracy = 0;
	
	this.velocity = 100;	// % per second
};

SwingMeter.prototype.tap = function()
{
	switch(this.state)
	{
		case 0:
			// Start swing meter upwards
			this.power = 0;
			this.state = 1;
			break;
		case 1:
			// Stop swing meter at upswing
			this.power = this.position;
			this.state = 2;
			break;
		case 2:
			// Stop swing meter to set the accuracy
			this.accuracy = this.position;
			this.state = 0;
			this.position = 0;
			
			// Call the callback
			this.doSwing(this.power, this.accuracy);
			break;
		default:
			// Should never happen
			this.state = 0;
			this.position = 0;	
			break;
	}
};

SwingMeter.prototype.update = function(elapsedSeconds)
{
	if (this.state == 1)
	{
		// Upswing
		this.position += this.velocity * elapsedSeconds;
		
		if (this.position >= this.maxPower)
		{
			this.position = this.maxPower;
			this.tap();	// Automatically trigger the downswing when we reach the max
		}
	}
	else if (this.state == 2)
	{
		// Downswing
		this.position -= this.velocity * elapsedSeconds;
		
		if (this.position <= this.minPower)
		{
			this.position = this.minPower;
			this.tap();	// Automatically trigger the downswing when we reach the max
		}
	}
};
