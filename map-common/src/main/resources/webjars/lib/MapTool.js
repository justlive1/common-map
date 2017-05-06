(function() {

	var root = this;
	
	var MapTool = function() {


	}

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = MapTool;
		}
		exports.MapTool = MapTool;
	} else if (typeof define === 'function' && define.amd) {
		define('MapTool', function() {
			return MapTool;
		});
	} else {
		root['MapTool'] = MapTool;
	}

}).call(this);