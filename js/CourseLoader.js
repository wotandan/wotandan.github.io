
// TODO: Pass in the holePicker
function CourseLoader(dir, callback)
{
	this.loaded = false;
	
	this.courseDir = dir;
	this.holeChangeCallback = callback;
	
	this.horizonImg = new Image();
	this.featureImages = [];
	
	this.currentHole = 0;
	
	this.courseContext = $('#courseMap')[0].getContext('2d');
	this.courseImageData = null;
	
	this.holePicker = $('#holePicker');
	
	var self = this;
	this.onSelectHole = function()
	{
		self.loadHole(self.holePicker.val());
	};
	
	this.holePicker.change(this.onSelectHole);
	
	this.loadCourseInfo();
}

CourseLoader.prototype.loadCourseInfo = function()
{
	this.horizonImg.src = this.courseDir + "Horizon.png";
	
	var self = this;
	$.ajax({
		dataType: 'json',
		url: this.courseDir + "course.js",
		success: setupCourseInfo
	});
	
	function setupCourseInfo(courseInfo)
	{
		self.courseInfo = courseInfo;

		// Load the images
		var i;
		for(i = 0; i < courseInfo.features.length; i++)
		{
			self.featureImages[i] = new Image();
			self.featureImages[i].src = self.courseDir + courseInfo.features[i].large
		}

		// Populate the hole picker
		for(i = 0; i < courseInfo.holes.length; i++)
		{
			self.holePicker.append('<option value="' + i + '">Hole ' + i + '</option>');
		}

		// Start at hole 1
		self.holePicker.val(1);
		self.onSelectHole();
		
		//self.loaded = true;
	};
};

CourseLoader.prototype.loadHole = function(hole_num)
{
	this.loaded = false;
	
	this.currentHole = hole_num;

	var self = this;
	
	var img = new Image();

	img.onload = function() {
		self.courseContext.drawImage(img, 0, 0);
		self.courseImageData = self.courseContext.getImageData(0, 0, 128, 64);

		self.loaded = true;
		
		self.holeChangeCallback();
	};
	
	img.src = this.courseDir + "Hole_" + hole_num + ".png";
};

CourseLoader.prototype.getCoursePixel = function(x, y)
{
	var color = { data: [0xAA, 0x55, 0x00, 255] };	// Default out of bounds to brown

	if (!this.loaded)
	{
		return color;
	}
	
	if(x < 0 || x >= this.courseImageData.width || y < 0 || y >= this.courseImageData.height)
	{
		return color;
	}

	var ofs = (this.courseImageData.width * y + x) * 4;

	for(var i = 0; i < 4; i++)
	{
		color.data[i] = this.courseImageData.data[ofs + i];
	}

	return color;
};

CourseLoader.prototype.getSortedFeatures = function(x, y)
{
	// Sort features by distance
	var holeFeatures = this.courseInfo.holes[this.currentHole].features;

	// Determine sort order using object keys
	var objFeatures = {};
	for(var f = 0; f < holeFeatures.length; f++)
	{
		var feature = holeFeatures[f];

		var x_dist = x - feature.x;
		var y_dist = feature.y - y;

		// Distance in yards
		feature.dist = Math.sqrt(x_dist * x_dist + y_dist * y_dist) * 5.0;

		var key = Math.round(feature.dist * 20.0);

		// Prevent key collisions
		while(objFeatures[key]) { key++; }

		objFeatures[key] = feature;
	}

	// Create sorted local features array
	var features = [];
	for(var key in objFeatures)
	{
		if(objFeatures.hasOwnProperty(key))
		{
			features.unshift(objFeatures[key]);
		}
	}

	return features;
};




