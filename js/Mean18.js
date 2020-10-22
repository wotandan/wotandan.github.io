
function Mean18()
{
	this.camera = new Camera();
	this.ball = new Ball();
	
	this.renderer = new Renderer(this.camera, this.ball);
	
	var self = this;
	var onKeyDelegate = function(event)
	{
		self.onKey(event);
	};
	
	$(document).keypress(onKeyDelegate);
	
	var lastTime = undefined;
	var renderLoop = function(timestamp)
	{
		if (lastTime === undefined)
		{
			lastTime = timestamp;
		}
		
		var elapsedSeconds = (timestamp - lastTime) / 1000.0;
		lastTime = timestamp;
		
		self.ball.updateBallPos(elapsedSeconds);
		self.renderer.drawScene();
		window.requestAnimationFrame(renderLoop);
	}	
	
	window.requestAnimationFrame(renderLoop);	
}

Mean18.prototype.onKey = function(event)
{
	var turn = 0.017453;
	var step = 0.25;

	switch(event.keyCode)
	{
		case 32: // spacebar
			// TODO: Show the swing gage to set the velocity
			this.ball.hitBall(50, this.camera.angle, 12);
			break;
		case 97: //left
			this.camera.angle += turn;
			break;
		case 119: //up
			this.camera.x += Math.sin(this.camera.angle) * step;
			this.camera.y += Math.cos(this.camera.angle) * step;
			break;
		case 100: //right
			this.camera.angle -= turn;
			break;
		case 115: //down
			this.camera.x -= Math.sin(this.camera.angle) * step;
			this.camera.y -= Math.cos(this.camera.angle) * step;
			break;
	}

	return false;
};