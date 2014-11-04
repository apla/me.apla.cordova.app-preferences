#!/usr/bin/env node

'use strict';

var fs      = require('fs');
var plist   = require('plist');
var libxml  = require('libxmljs');

var mp = require('./lib/mobile_preferences.js');


fs.readFile('app-settings.json', function(err, data) {
	if (err) {
		throw err;
    }
    
	var configJson = JSON.parse(data);

    var iosItems = mp.iosBuildItems(configJson);
    
	var plistXml = plist.build({ PreferenceSpecifiers: iosItems });    
    
	fs.exists('platforms/ios', function(exists) {
		if (!exists) {
			console.error('platform ios not found');
            return;
        }
        
		fs.mkdir('platforms/ios/Settings.bundle', function(e) {
			if (e && e.code != 'EEXIST') {
				throw e;
            }
            
			// Write settings plist
			fs.writeFile('platforms/ios/Settings.bundle/Root.plist', plistXml, function(err) {
				if (err) {
					throw err;
                }
				console.log('ios settings bundle was successfully generated');
			});

			// Write localization resource file
			fs.mkdir('platforms/ios/Settings.bundle/en.lproj', function(e) {
				if (e && e.code != 'EEXIST') {
					throw e;
                }
				fs.writeFile('platforms/ios/Settings.bundle/en.lproj/Root.strings', '/* */', function(err) {
					if (err) {
						throw err;
                    }
				});
			});
		});
	});


    var doc = mp.androidBuildNodes(configJson);
    var strings = [];

	fs.exists('platforms/android', function(exists) {
		if (!exists) {
			console.error('platform android not found');
            return;
        }

		fs.mkdir('platforms/android/res/xml', function(e) {
			if (e && e.code != 'EEXIST') {
				throw e;
            }

			// Write settings plist
			fs.writeFile('platforms/android/res/xml/preference.xml', doc.toString(), function(err) {
				if (err) {
					throw err;
                }
				console.log('android preferences file was successfully generated');
			});

			// Write localization resource file
			fs.mkdir('platforms/android/res/values', function(e) {
				if (e && e.code != 'EEXIST') {
					throw e;
                }
				strings.forEach(function(file) {
					fs.writeFile('platforms/android/res/values/' + file.name + '.xml', file.xml, function(err) {
						if (err) {
							throw err;
                        }
					});
				});
			});
		});
	});

});