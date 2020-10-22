function rad2deg(angle) { return angle / 0.017453292519943295; }

// TODO: Pass in element name instead of using #3dview
function Renderer(cam, bal)
{
	this.viewport = $('#3dview')[0].getContext('2d');
	
	this.viewport.imageSmoothingEnabled = false;
	this.viewport.mozImageSmoothingEnabled = false;
	this.viewport.webkitImageSmoothingEnabled = false;
	
	this.viewportImageData = this.viewport.createImageData(592, 310);

	this.camera = cam;
	this.ball = bal;
	
	var self = this;
	this.onHoleChange = function()
	{
		var hole_info = self.course.courseInfo.holes[self.course.currentHole];

		self.camera.x = hole_info.features[1].x;
		self.camera.y = hole_info.features[1].y;

		// Drop the ball at the current location
		self.ball.x = self.camera.x + 5;
		self.ball.y = self.camera.y;
	};
	
	this.course = new CourseLoader("BUSHHILL.M18/", this.onHoleChange);
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
		this.drawGround();
	}
	
	// Render results of drawGround
	this.viewport.putImageData(this.viewportImageData, 0, 40);

	this.drawFeatures();
	
	this.drawBall();
};

Renderer.prototype.drawBall = function()
{
	var width = 592;
	
	// TODO: Refactor to share code with drawFeatures
	var x_dist = this.camera.x - this.ball.x;
	var y_dist = this.ball.y - this.camera.y;
	
	var dist = Math.sqrt(x_dist * x_dist + y_dist * y_dist) * 5.0;
	
	if(dist < 2 || dist > 400) { return; }

	// Determine Y pos for drawing
	var scr_y = 12.5447 * Math.pow(dist, 0.563497); // Perfect!

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
	var view_px_per_px = pixels_away / width;
	var scr_x = (cp_dist / view_px_per_px) + width / 2;	// Perfect!

	var scr_z = 0;
	if (this.ball.z)
	{
		scr_z = this.ball.z / view_px_per_px;
	}

	var scale = (280.0 / dist);
	
	// Draw distant objects beyond horizon, just make them shorter so it looks like they're peeking
	var height_diff = 0;
	if(dist > 292) { height_diff = (dist - 292) / 2.0; }

	var tgt_height = height_diff * scale;

	var top = (350 - (scr_y + scr_z)) + height_diff;
	
	var radius = scale * 0.3;
	
	if (radius < 1)
	{
		radius = 1;
	}

	// Draw distant objects beyond horizon, just make them shorter so it looks like they're peeking
	this.viewport.fillStyle = "white";
	this.viewport.beginPath();
	this.viewport.ellipse(scr_x, top, radius, radius, 0, 0, 2 * Math.PI);
	this.viewport.fill();

};

Renderer.prototype.drawFeatures = function()
{
	var width = 592;

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
		var scr_y = 12.5447 * Math.pow(dist, 0.563497); // Perfect!

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
		var view_px_per_px = pixels_away / width;
		var scr_x = (cp_dist / view_px_per_px) + width / 2;	// Perfect!

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
	if(dist > 292) { height_diff = (dist - 292) / 2.0; }

	var img = this.course.featureImages[item_id];

	var tgt_width = img.width * scale * 2.0; // Double-wide
	var tgt_height = (img.height - height_diff) * scale;

	var left = x - tgt_width / 2.0;
	var top  = (350 - ((y + z) + tgt_height)) + height_diff;

	this.viewport.drawImage(img, 0, 0, img.width, img.height - height_diff, left, top, tgt_width, tgt_height);
};

Renderer.prototype.setImageDataPixel = function(x, y, color)
{
	var ofs = (this.viewportImageData.width * y + x) * 4;

	// The more green something it is the more interference it may have.  Adds texture
	var chance = (color.data[1]) / 255.0 + 0.2;
	var tweak = (Math.random() > chance);

	for(var i = 0; i < 4; i++)
	{
		if(tweak && i < 3)
		{
			this.viewportImageData.data[ofs + i] = (color.data[i] - 35) % 0xFF;
		}
		else
		{
			this.viewportImageData.data[ofs + i] = color.data[i];
		}
	}
};

Renderer.prototype.drawGround = function(camera)
{
	var sin_r = Math.sin(this.camera.angle);
	var cos_r = Math.cos(this.camera.angle);

	var sin_la = Math.sin(this.camera.angle - 1.5708);
	var cos_la = Math.cos(this.camera.angle - 1.5708);

	// Draw the course
	for(var y = 0; y < 310; y++)
	{
		var topOff = 309 - y;

		// Calculate distance to scanline
		var pixels_away = (0.0112367131 * Math.pow(y, 1.7744631)) / 5.0;
		var view_px_per_px = pixels_away / 592;

		var cp_x = this.camera.x + sin_r * pixels_away;
		var cp_y = this.camera.y + cos_r * pixels_away;

		// Now go 90 degrees from each side
		var mx = sin_la * view_px_per_px;
		var my = cos_la * view_px_per_px;

		for(var x = 0; x < 592; x++)
		{
			var src_x = Math.round(cp_x - mx * (296 - x));
			var src_y = Math.round(cp_y - my * (296 - x));

			var color = this.course.getCoursePixel(src_x, src_y);

			this.setImageDataPixel(x, topOff, color);
		}
	}
};

Renderer.prototype.drawHorizon = function()
{
	// Draw the horizon, rotated to match our angle
	var horizonOffset = ((rad2deg(this.camera.angle) % 360) * 10) % 512;
	for(var h = -1; h < 2; h++)
	{
		var xof = h * 512 + horizonOffset;
		this.viewport.drawImage(this.course.horizonImg, 0, 0, 128, 20, xof, 0, 512, 40);
	}
};

