var AppPreferencePlugin = module.exports = function (config) {


}

AppPreferencePlugin.prototype.fetch = function(key, successCallback, errorCallback) {
	// fetch have optional dict parameter
	// so, you can access parameter via fetch (dict, key), or fetch (key)
	var dict = '';
	if (arguments.length >= 3 && typeof arguments[1] != 'function') {
		dict = key;
		key  = arguments[1];
		ok   = arguments[2];
		fail = arguments[3];
	}

	var _successCallback = function (response) {
		var result;
		try {
			result = JSON.parse (response);
		} catch (e) {
			result = response;
		}
		successCallback (result);
	};

	var execStatus = cordova.exec (
		_successCallback, errorCallback || function () {},
		"AppPreferences", "getSetting", [{
			key:  key,
			dict: dict
		}]
	);
};

AppPreferencePlugin.prototype.store = function(key, value, successCallback, errorCallback) {
	// fetch have optional dict parameter
	// so, you can access parameter via store (dict, key, value), or store (key, value)
	var dict  = '';
	if (arguments.length >= 4 && typeof arguments[2] != 'function') {
		dict  = key;
		key   = arguments[1];
		value = arguments[2];
		ok    = arguments[3];
		fail  = arguments[4];
	}

	value = JSON.stringify (value);

	var execStatus = cordova.exec (
		successCallback || function () {}, errorCallback || function () {},
		"applicationPreferences", "setSetting", [{
			key:   key,
			dict:  dict,
			value: value
		}]
	);
};