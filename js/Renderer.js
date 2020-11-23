function rad2deg(angle) { return angle / 0.017453292519943295; }

// TODO: Pass in element name instead of using #3dview
function Renderer(cam, bal, course)
{
	this.canvas = $('#3dview')[0];
	
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	
	this.horizonHeight = 40;
	this.groundHeight = this.height - this.horizonHeight;
	
	// Calculate scale value to correct for non-standard viewport size
	this.view_scale = 310 / this.groundHeight;
	
	this.viewport = this.canvas.getContext('2d');
	this.viewport.imageSmoothingEnabled = false;
	this.viewport.mozImageSmoothingEnabled = false;
	this.viewport.webkitImageSmoothingEnabled = false;
	
	this.viewportImageData = this.viewport.createImageData(this.width, this.groundHeight);

	this.camera = cam;
	this.ball = bal;
	
	this.swing = null;	// Set later
	
	this.course = course;
	
	this.renderBackground = new RenderBackground(this.viewportImageData, course);
}

Renderer.prototype.drawScene = function()
{
	if (!this.course.loaded)
	{
		return;
	}
	
	this.drawHorizon();

	if (this.camera.moved())
	{
		this.renderBackground.drawGround(this.camera);
	}
	
	// Render results of drawGround
	this.viewport.putImageData(this.viewportImageData, 0, this.horizonHeight);

	this.drawFeatures();
	
	this.drawBall();
	
	if (this.swing != null)
	{
		this.drawPowerMeter(this.swing.position, this.swing.power);
	}
};

Renderer.prototype.drawPowerMeter = function(position, power)
{
	// Position goes from -20 to +120
	var pxPerPercent = this.height / 140;

	var zeroPos = this.height - (pxPerPercent * 20);
	
	var barHeight = (pxPerPercent * position);
	
	// Background
	this.viewport.fillStyle = "black";
	this.viewport.fillRect(0, 0, 30, this.height);
	
	// Bar
	this.viewport.fillStyle = "red";
	this.viewport.fillRect(0, zeroPos - barHeight, 30, barHeight);
	
	// Top bar
	var powerBar = (pxPerPercent * power);
	this.viewport.fillRect(0, zeroPos - powerBar, 30, 3);
	
	// Zero bar
	this.viewport.fillStyle = "white";
	this.viewport.fillRect(0, zeroPos, 30, 3);
};

Renderer.prototype.drawBall = function()
{
	// TODO: Refactor to share code with drawFeatures
	var x_dist = this.camera.x - this.ball.x;
	var y_dist = this.ball.y - this.camera.y;
	
	var dist = Math.sqrt(x_dist * x_dist + y_dist * y_dist) * 5.0;
	
	if(dist < 2 || dist > 400) { return; }

	// Determine Y pos for drawing
	var scr_y = (12.5447 * Math.pow(dist, 0.563497)) / this.view_scale; // Perfect!

	// Determine how far away our center point is from the item
	var sin_r = Math.sin(this.camera.angle);
	var cos_r = Math.cos(this.camera.angle);
	
	var pixels_away = dist / 5.0;
	var cp_x = this.camera.x + sin_r * pixels_away;
	var cp_y = this.camera.y + cos_r * pixels_away;
	
	var px_dist = cp_x - this.ball.x;
	var py_dist = this.ball.y - cp_y;

	var cp_dist = Math.sqrt(px_dist * px_dist + py_dist * py_dist);
	
	// Determine the cross product between the angles - this indicates if its to left or right
	var x1 = sin_r * pixels_away * (this.ball.y - this.camera.y);
	var y1 = cos_r * pixels_away * (this.ball.x - this.camera.x);
	if(x1 < y1) { cp_dist *= -1.0; }

	// Determine X pos for drawing
	var view_px_per_px = pixels_away / this.width;
	var scr_x = (cp_dist / view_px_per_px) + this.width / 2;	// Perfect!

	var scr_z = 0;
	if (this.ball.z)
	{
		scr_z = this.ball.z / view_px_per_px;
	}

	var scale = (280.0 / dist);
	
	// Don't draw ball beyond horizon
	if(dist > 292) { return; }

	var radius = scale * 0.3;
	if (radius < 1)
	{
		radius = 1;
	}
	
	// Draw the ball's shadow
	var shadowTop = (this.height - scr_y);
	
	this.viewport.fillStyle = "black";
	this.viewport.beginPath();
	this.viewport.ellipse(scr_x, shadowTop + radius, radius, radius / 2, 0, 0, 2 * Math.PI);
	this.viewport.fill();
	
	// Draw the ball itself
	var ballTop = shadowTop - scr_z;// + height_diff;
	this.viewport.fillStyle = "white";
	this.viewport.beginPath();
	this.viewport.ellipse(scr_x, ballTop, radius, radius, 0, 0, 2 * Math.PI);
	this.viewport.fill();
	
	// Add an outline around the ball to make it more visible
	var outlineWidth = 0.5;
	if (radius < 3)
	{
		outlineWidth *= (radius / 3);
	}
	
	this.viewport.lineWidth = outlineWidth;
	this.viewport.strokeStyle = "black";
	this.viewport.stroke();

};

Renderer.prototype.drawFeatures = function()
{
	var features = this.course.getSortedFeatures(this.camera.x, this.camera.y);

	var sin_r = Math.sin(this.camera.angle);
	var cos_r = Math.cos(this.camera.angle);

	for(var i = 0; i < features.length; i++)
	{
		var feature = features[i];

		// Distance in yards
		var dist = feature.dist;
		
		if (!feature.dist)
		{
			var x_dist = this.camera.x - feature.x;
			var y_dist = feature.y - this.camera.y;

			dist = Math.sqrt(x_dist * x_dist + y_dist * y_dist) * 5.0;
		}
		
		var pixels_away = dist / 5.0;
		
		// Note: Items past 300 yards will appear to be peeking out from behind horizon
		if(dist < 2 || dist > 400) { continue; }

		// Determine Y pos for drawing
		var scr_y = (12.5447 * Math.pow(dist, 0.563497)) / this.view_scale; // Perfect!

		// Determine how far away our center point is from the item
		var cp_x = this.camera.x + sin_r * pixels_away;
		var cp_y = this.camera.y + cos_r * pixels_away;

		var px_dist = cp_x - feature.x;
		var py_dist = feature.y - cp_y;

		var cp_dist = Math.sqrt(px_dist * px_dist + py_dist * py_dist);

		// Determine the cross product between the angles - this indicates if its to left or right
		var x1 = sin_r * pixels_away * (feature.y - this.camera.y);
		var y1 = cos_r * pixels_away * (feature.x - this.camera.x);
		if(x1 < y1) { cp_dist *= -1.0; }

		// Determine X pos for drawing
		var view_px_per_px = pixels_away / this.width;
		var scr_x = (cp_dist / view_px_per_px) + this.width / 2;	// Perfect!

		var scr_z = 0;
		if(feature.z)
		{
			scr_z = feature.z / view_px_per_px;
		}

		this.drawFeatureAt(feature.item_id, scr_x, scr_y, scr_z, dist);
	}
};


Renderer.prototype.drawFeatureAt = function(item_id, x, y, z, dist)
{
	// TODO:  Improve scaling - make smaller when further away, close is fine
	var scale = (280.0 / dist);

	// Draw distant objects beyond horizon, just make them shorter so it looks like they're peeking
	var height_diff = 0;
	if(dist > 292) 
	{
		height_diff = (dist - 292) / 2.0; 
		height_diff /= this.view_scale;
	}

	var img = this.course.featureImages[item_id];

	var tgt_width = img.width * scale * 2.0; // Double-wide
	var tgt_height = (img.height - height_diff) * scale;

	var left = x - tgt_width / 2.0;
	var top  = (this.height - ((y + z) + tgt_height)) + height_diff;

	this.viewport.drawImage(img, 0, 0, img.width, img.height - height_diff, left, top, tgt_width, tgt_height);
};

Renderer.prototype.drawHorizon = function()
{
	// Draw the horizon, rotated to match our angle
	var horizonOffset = ((rad2deg(this.camera.angle) % 360) * 10) % 512;
	for(var h = -1; h < 2; h++)
	{
		var xof = h * 512 + horizonOffset;
		this.viewport.drawImage(this.course.horizonImg, 0, 0, 128, 20, xof, 0, 512, this.horizonHeight);
	}
};
