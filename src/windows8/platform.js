function AppPreferencesW8() {

}

// http://blogs.msdn.com/b/going_metro/archive/2012/04/22/integrating-with-windows-8-settings-charm.aspx
// http://msdn.microsoft.com/en-us/library/windows/apps/hh770544.aspx
// http://www.silverlightshow.net/items/Windows-8-Metro-Add-settings-to-your-application.aspx

AppPreferencesW8.prototype.nativeFetch = function(successCallback, errorCallback, args) {

	var self = this;

	// no support for windows phone 8
	var settings = Windows.Storage.ApplicationData.current.localSettings;

	var hasContainer;
	if (args.dict)
		hasContainer = settings.containers.hasKey(args.dict);

	if (args.dict && !hasContainer) {
	    return successCallback(null);
	}

	var result = null;
	if (hasContainer) {
		// Access data in: 
	    if (settings.containers.lookup(args.dict).values.hasKey(args.key))
	        result = settings.containers.lookup(args.dict).values[args.key];

	} else if (settings.values.hasKey(args.key)) {
		result = settings.values[args.key];
	}

	var value = null;
	if (result) {
		try {
			value = JSON.parse (result);
		} catch (e) {
			value = result;
		}
	}
	successCallback(value);

    // argscheck.checkArgs('fF', 'Device.getInfo', arguments);
    // exec(successCallback, errorCallback, "Device", "getDeviceInfo", []);
};

AppPreferencesW8.prototype.nativeStore = function(successCallback, errorCallback, args) {

	var self = this;

	args.value = JSON.stringify(args.value);

	// no support for windows phone 8
	var settings = Windows.Storage.ApplicationData.current.localSettings;

	if (args.dict) {
		var hasContainer = settings.containers.hasKey(args.dict);

		// debugger;

		if (!hasContainer) {
			var container = settings.createContainer(args.dict, Windows.Storage.ApplicationDataCreateDisposition.Always);
		}
		settings = settings.containers[args.dict];			
	}
	
	settings.values[args.key] = args.value;

	successCallback ();
	
    // argscheck.checkArgs('fF', 'Device.getInfo', arguments);
    // exec(successCallback, errorCallback, "Device", "getDeviceInfo", []);
};

AppPreferencesW8.prototype.nativeRemove = function (successCallback, errorCallback, args) {

    var self = this;

    // no support for windows phone 8
    var settings = Windows.Storage.ApplicationData.current.localSettings;

    var hasContainer;
    if (args.dict)
        hasContainer = settings.containers.hasKey(args.dict);

    if (args.dict && !hasContainer) {
        return successCallback(null);
    }

    var result = null;
    if (hasContainer) {
        // Access data in: 
        if (settings.containers.lookup(args.dict).values.hasKey(args.key))
            result = settings.containers.lookup(args.dict).values.remove (args.key);

    } else if (settings.values.hasKey(args.key)) {
        result = settings.values.remove (args.key);
    }

    successCallback();

    // argscheck.checkArgs('fF', 'Device.getInfo', arguments);
    // exec(successCallback, errorCallback, "Device", "getDeviceInfo", []);
};


module.exports = new AppPreferencesW8();
