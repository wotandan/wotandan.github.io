
function ClubSelector()
{
	this.clubs = [
		// https://www.dickssportinggoods.com/p/top-flite-2020-xl-13-piece-complete-set-graphite-steel-19tflmtpflt20xlrdset/19tflmtpflt20xlrdset
		new Club("Driver", 10.5, 44.5),
		
		// https://cdn0.globalgolf.com/images/product/techspecs/1042812_Callaway_Rogue_Fairway_specs.PNG
		new Club("3 Wood", 15.0, 43.0),
		new Club("4 Wood", 17.0, 42.75),
		new Club("5 Wood", 19.0, 42.5),

		// https://danbubanygolf.com/club-fitting-variables-no-5-6-7/
		new Club("2 Iron", 18.5, 39.25),
		new Club("3 Iron", 21.0, 38.75),
		new Club("4 Iron", 24.0, 38.25),
		new Club("5 Iron", 27.0, 37.75),
		new Club("6 Iron", 30.5, 37.25),
		new Club("7 Iron", 34.0, 36.75),
		new Club("8 Iron", 38.0, 36.25),
		new Club("9 Iron", 42.0, 35.75),

		new Club("PW",     46.0, 35.5),
		new Club("SW",     54.0, 35.25),
	
		new Club("Putter",  3.5, 34.0),
	];
	
	// Set up the select box
	this.clubPicker = $('#clubPicker');
	for(id = 0; id < this.clubs.length; id++)
	{
		this.clubPicker.append('<option value="' + id + '">' + this.clubs[id].name + '</option>');
	}

	// Start at driver
	this.clubPicker.val(0);
	
	var self = this;
	this.onSelectClub = function()
	{
		self.clubPicker.blur();
	};
	
	this.clubPicker.change(this.onSelectClub);
	
	// TODO: Show some kinda statistics on selected club
};

ClubSelector.prototype.getSelectedClub = function()
{
	var id = this.clubPicker.val();
	return this.clubs[id];	
};