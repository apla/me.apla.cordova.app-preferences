function AppPreferencesLocalStorage() {

}

AppPreferencesLocalStorage.prototype.nativeFetch = function(successCallback, errorCallback, args) {

	var self = this;

	var key = args.key;

	if (args.dict)
		key = args.dict + '.' + args.key;

	var result = window.localStorage.getItem (key);

	var value = result;
	try {
		value = JSON.parse (result);
	} catch (e) {
	}
	successCallback (value);
};

AppPreferencesLocalStorage.prototype.nativeRemove = function(successCallback, errorCallback, args) {

	var self = this;

	var key = args.key;

	if (args.dict)
		key = args.dict + '.' + args.key;

	var result = window.localStorage.removeItem (key);

	successCallback (true);
};

AppPreferencesLocalStorage.prototype.nativeStore = function(successCallback, errorCallback, args) {

	var self = this;

	var key = args.key;

	if (args.dict)
		key = args.dict + '.' + args.key;

	var value = JSON.stringify (args.value);

	window.localStorage.setItem (key, value);

	successCallback ();
};

AppPreferencesLocalStorage.prototype.clearAll = function (successCallback, errorCallback) {

	var self = this;

	window.localStorage.clear ();

	successCallback ();
};

AppPreferencesLocalStorage.prototype.show = function (successCallback, errorCallback) {

	var self = this;

	errorCallback ('not implemented');
};

if (typeof module !== "undefined") {
	module.exports = new AppPreferencesLocalStorage();
}
