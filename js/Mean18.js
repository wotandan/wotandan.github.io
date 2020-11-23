
function Mean18()
{
	this.bag = new ClubSelector();
	
	this.camera = new Camera();
	this.ball = new Ball();
	
	var self = this;
	
	this.onHoleChange = function()
	{
		var hole_info = self.course.courseInfo.holes[self.course.currentHole];

		// Drop the ball at the start location
		self.ball.x = hole_info.features[1].x;
		self.ball.y = hole_info.features[1].y;

		// Aim camera towards the hole by default
		self.faceHole();
		self.moveCamera();
	};
	
	this.course = new CourseLoader("BUSHHILL.M18/", this.onHoleChange);
	this.renderer = new Renderer(this.camera, this.ball, this.course);
	
	var onKeyDelegate = function(event)
	{
		self.onKey(event);
		//self.onKeyFreeMovement(event);
	};
	
	$(document).keypress(onKeyDelegate);
	
	this.setupTouchEvents();
	
	var onSwingDelegate = function(power, accuracy)
	{
		var club = self.bag.getSelectedClub();
		
		// TODO: Store the accuracy somewhere to use for hook/slice
		//	Possibly set as spin factor on the ball itself
		self.ball.velocity = club.swing(power, self.camera.angle);
	};
	
	this.swing = new SwingMeter(onSwingDelegate);
	this.renderer.swing = this.swing;	
	
	var lastTime = undefined;
	var renderLoop = function(timestamp)
	{
		if (lastTime === undefined)
		{
			lastTime = timestamp;
		}
		
		var elapsedSeconds = (timestamp - lastTime) / 1000.0;
		lastTime = timestamp;
		
		self.swing.update(elapsedSeconds);
		self.ball.updateBallPos(elapsedSeconds);
		self.renderer.drawScene();
		window.requestAnimationFrame(renderLoop);
	}	
	
	window.requestAnimationFrame(renderLoop);	
}

Mean18.prototype.onKey = function(event)
{
	var turn = 0.017453;

	switch(event.keyCode)
	{
		case 32: // spacebar
			this.swing.tap();	// Trigger the swing meter
			break;
		case 97: //left
			this.camera.angle += turn;
			this.moveCamera();
			break;
		case 100: //right
			this.camera.angle -= turn;
			this.moveCamera();
			break;
	}

	return false;
};

Mean18.prototype.onKeyFreeMovement = function(event)
{
	var turn = 0.017453;
	var step = 0.25;

	switch(event.keyCode)
	{
		case 32: // spacebar
			this.swing.tap();	// Trigger the swing meter
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

Mean18.prototype.faceHole = function()
{
	var flag = this.course.getFlagFeature();
	if (flag != null)
	{
		var dx = flag.x - this.ball.x;
		var dy = flag.y - this.ball.y;
		
		this.camera.angle = Math.atan2(dx, dy);
	}
	else
	{
		this.camera.angle = 1.5708;	// Default angle
	}
};

Mean18.prototype.moveCamera = function()
{
	// Set camera position relative to the ball
	this.camera.x = this.ball.x - Math.sin(this.camera.angle) * 2;
	this.camera.y = this.ball.y - Math.cos(this.camera.angle) * 2;
};

Mean18.prototype.setupTouchEvents = function()
{
	var lastx = null;
	var moved = false;
	
	var canvas = $('#3dview')[0];
	canvas.onmousedown = function(e)
	{
		lastx = e.offsetX;
		moved = false;
	};
	
	var turn = 0.002;
	var self = this;
	
	canvas.onmousemove = function(e)
	{
		if (lastx == null) {return;}
		
		var x = e.offsetX;
		var dx = x - lastx;
		
		if (dx != 0)
		{
			moved = true;
			self.camera.angle += dx * turn;
			self.moveCamera();
			
			lastx = x;
		}	
	};
	
	canvas.onmouseup = function(e)
	{
		lastx = null;
	};
	
	canvas.onclick = function(e)
	{
		if (!moved)
		{
			// Only swing if we haven't moved
			self.swing.tap();
		}
	};
};


