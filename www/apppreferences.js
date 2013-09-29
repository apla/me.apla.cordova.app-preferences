/**
 * This module contains basic cross-platform request. platform's request override common one
 * @constructor
 */
var platform = {};
try {
	platform = require ('./platform');
} catch (e) {
	
}

function AppPreferences() {

}

AppPreferences.prototype.prepareKey = platform.prepareKey || function (mode, dict, key, value) {
	var argList = [].slice.apply(arguments);
	argList.shift();
	if ((mode == 'get' && argList.length == 1) || (mode == 'set' && argList.length == 2)) {
		argList.unshift (void 0);
	}
	var args = {
		key: argList[1]
	};
	if (argList[0] !== void 0)
		args.dict = argList[0]
	
	if (mode == 'set')
		args.value = argList[2];
	
	return args;
}

/**
 * Get a preference value
 *
 * @param {Function} successCallback The function to call when the value is available
 * @param {Function} errorCallback The function to call when value is unavailable
 * @param {String} dict Dictionary for key (OPTIONAL)
 * @param {String} key Key
 */
AppPreferences.prototype.getValue = platform.getValue || function (
	successCallback, errorCallback, dict, key
	) {

		var args = this.prepareKey ('get', dict, key);

		if (!args.key) {
			errorCallback ();
			return;
		}

		console.log('PREFERENCE GET');

		_successCallback = function (_value) {
			var value;
			try {
				value = JSON.parse (_value);
			} catch (e) {
				value = _value;
			}
			successCallback (value);
		}

		var execStatus = cordova.exec (
			_successCallback, errorCallback,
			"AppPreferences", "getValue", [args]
		);
};

/**
 * Set a preference value
 *
 * @param {Function} successCallback The function to call when the value is set successfully
 * @param {Function} errorCallback The function to call when value is not set
 * @param {String} dict Dictionary for key (OPTIONAL)
 * @param {String} key Key
 * @param {String} value Value
 */
AppPreferences.prototype.setValue = platform.setValue || function (
	successCallback, errorCallback, dict, key, value
	) {

		var args = this.prepareKey ('get', dict, key, value);

		if (!args.key || !args.value) {
			errorCallback ();
			return;
		}

		args.value = JSON.stringify (args.value);

		console.log('PREFERENCE SET');

		var execStatus = cordova.exec (
			successCallback, errorCallback,
			"AppPreferences", "setValue", [args]
		);
};


module.exports = new AppPreferences();
