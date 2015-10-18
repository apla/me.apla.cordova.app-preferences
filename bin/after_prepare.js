'use strict';

module.exports = function (context) {
	var req = context.requireCordovaModule,
		
		Q = req('q'),
		path = req('path'),
		fs = require("./lib/filesystem")(Q, req('fs'), path),
		settings = require("./lib/settings")(fs, path),

		android = require("./lib/android")(fs, path, req('elementtree'), req('cordova-lib/src/cordova/util'), req('cordova-lib').configparser),
		ios = require("./lib/ios")(Q, fs, path, req('plist'), req('xcode'));
	
    return settings.get()
		.then(function (config) {
			return Q.all([
				android.build(config),
				ios.build(config)
			]);
		})
		.catch(function(err) {
			if (err.code === 'NEXIST') {
				console.log("app-settings.json not found: skipping build");
				return;
			}
			
			throw err;
		});
};
