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
    
	var config = JSON.parse(data);

    var items = mp.iosBuildItems(config);
    
	var plistXml = plist.build({ PreferenceSpecifiers: items });    
    
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



	// build Android settings XML

	var doc = new libxml.Document();
	var strings = [];
	var n = doc
		.node('PreferenceScreen')
		.attr({'xmlns:android': 'http://schemas.android.com/apk/res/android'});


	function androidConfigMap(parent, config) {
        
		if (config.type == 'group') {
			var g = parent
				.node('PreferenceCategory')
				.attr({'android:title': config.name || config.title});

			config.items.forEach(function(item) {
				androidConfigMap(g, item);
			});
            
		} else {

			var attr = {
				'android:title': config.title,
				'android:key': config.name,
				'android:defaultValue': config['default']
			}

			switch (config.type) {
				case 'combo':
					// Generate resource file
					var d = new libxml.Document();
					var res = d.node('resources');
					var titles = res.node('string-array').attr({name: config.name}),
					    values = res.node('string-array').attr({name: config.name + 'Values'});

					config.items.forEach(function(item) {
						titles.node('item', item.name || item.title);
						values.node('item', item.id || item.value);
					});

					strings.push({
						name: config.name,
						xml: d.toString()
					});

					attr['android:entries'] = '@array/' + config.name;
					attr['android:entryValues'] = '@array/' + config.name + 'Values';

					parent
						.node('ListPreference')
						.attr(attr)
				break;
			}
		}
	}
	androidData.forEach(function(item) {
		androidConfigMap(n, item);
	});


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