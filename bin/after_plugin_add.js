'use strict';

module.exports = function (context) {
	var req = context.requireCordovaModule,
		path = req('path'),
		fs = require("./lib/filesystem")(req('q'), req('fs'), path),
		settings = require("./lib/settings")(fs, path);
	
    return settings.get()
		.catch(function(err) {
			if (err.code === 'NEXIST') {
				console.log("app-settings.json not found: creating a sample file");
				return settings.create();
			}
			
			throw err;
		});
};
