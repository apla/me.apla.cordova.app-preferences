'use strict';

var appSettingsPath = 'app-settings.json';

module.exports = function (context) {
	var req = context.requireCordovaModule,
		
		Q = req('q'),
		path = req('path'),
		fs = require("./lib/filesystem")(Q, req('fs'), path),
		
		android = require("./lib/android")(fs, path, req('elementtree'), req('cordova-lib/src/cordova/util'), req('cordova-lib').configparser),
		ios = require("./lib/ios")(Q, fs, path, req('plist'), req('xcode'));
	
    return fs.exists(appSettingsPath)
		.then(function() { return fs.readFile(appSettingsPath); })
		.then(JSON.parse)
		.then(function (config) {
			return Q.all([
				android.clean(config),
				ios.clean(config)
			]);
		})
		.then(function() { return fs.unlink(appSettingsPath); })
		.catch(function(err) {
			if (err.code === 'NEXIST') {
				console.log("app-settings.json not found: skipping build");
				return;
			}
			
			throw err;
		});
};
