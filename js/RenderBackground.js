
function RenderBackground(viewportImageData, course)
{
	this.width = viewportImageData.width;
	this.midpoint = this.width / 2;
	
	this.height = viewportImageData.height;
	
	// Calculate scale value to correct for non-standard viewport size
	this.view_scale = 310 / this.height;
	
	this.viewportImageData = viewportImageData;
	
	this.course = course;
}

RenderBackground.prototype.drawGround = function(camera)
{
	var sin_r = Math.sin(camera.angle);
	var cos_r = Math.cos(camera.angle);

	var sin_la = Math.sin(camera.angle - 1.5708);
	var cos_la = Math.cos(camera.angle - 1.5708);
	
	// Draw the course
	for(var y = 0; y < this.height; y++)
	{
		var topOff = this.height - (y + 1);

		// Scale the Y value based on the static height of 310
		var scaled_y = y * this.view_scale;
		
		// Calculate distance to scanline
		var pixels_away = (0.0112367131 * Math.pow(scaled_y, 1.7744631)) / 5.0;
		var view_px_per_px = pixels_away / this.width;

		var cp_x = camera.x + sin_r * pixels_away;
		var cp_y = camera.y + cos_r * pixels_away;

		// Now go 90 degrees from each side
		var mx = sin_la * view_px_per_px;
		var my = cos_la * view_px_per_px;

		for(var x = 0; x < this.width; x++)
		{
			var src_x = Math.round(cp_x - mx * (this.midpoint - x));
			var src_y = Math.round(cp_y - my * (this.midpoint - x));

			var color = this.course.getCoursePixel(src_x, src_y);

			this.setImageDataPixel(x, topOff, color);
		}
	}
};

RenderBackground.prototype.setImageDataPixel = function(x, y, color)
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