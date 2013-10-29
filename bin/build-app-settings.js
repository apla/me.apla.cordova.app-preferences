#!/usr/bin/env node

var fs = require('fs');
var plist = require('plist');

function ucfirst(s) {
	return s.charAt(0).toUpperCase() + s.substring(1);
}

var ConfigMap = function(config) {
	// iOS
	if (config.type)
		switch (config.type) {
			case 'combo':
				config.type = 'PSMultiValueSpecifier';

				config.DefaultValue = config['default'];
				delete config['default'];

				config.Key = config.name;
				delete config['name'];

				config.titles = [];
				config.values = [];
				config.items.forEach(function(a) {
					config.values.push(a.id || a.value);
					config.titles.push(a.name || a.title);
				});
				delete config.items;
			break;
			case 'group':
				config.type = 'PSGroupSpecifier';
			break;
	}

	Object.keys(config).forEach(function(k) {
		var uc = ucfirst(k);
		config[uc] = config[k];
		if (uc != k)
			delete config[k];
	})

	return config;
}


fs.readFile('app-settings.json', function(err, data) {
	if (err)
		throw err;

	data = JSON.parse(data);
	var items = [];
	while (data.length) {
		var src = data.shift();
		if (src.type == 'group') {
			src.items.forEach(function(s) {
				data.unshift(s);
			});
			delete src['items'];
		}
		items.push(ConfigMap(src));
	}

	var xml = plist.build({ PreferenceSpecifiers: items });
	fs.exists('platforms/ios', function(exists) {
		if (!exists)
			throw 'platform ios not found';

		fs.mkdir('platforms/ios/Settings.bundle', function(e) {
			if (e && e.code != 'EEXIST')
				throw e;

			// Write settings plist
			fs.writeFile('platforms/ios/Settings.bundle/Root.plist', xml, function(err) {
				if (err)
					throw err;
				console.log('plist was successfully generated');
			});

			// Write localization resource file
			fs.mkdir('platforms/ios/Settings.bundle/en.lproj', function(e) {
				if (e && e.code != 'EEXIST')
					throw e;
				fs.writeFile('platforms/ios/Settings.bundle/en.lproj/Root.strings', '/* */', function(err) {
					if (err)
						throw err;
				});
			});
		});
	});
});