#!/usr/bin/env node

var fs = require('fs');
var builder = require('xmlbuilder');
var doc = builder.create();

function ucfirst(s) {
	return s.charAt(0).toUpperCase() + s.substring(1);
}

var ConfigMap = function(config) {
	// iOS
	if (config.type)
		switch (config.type) {
			case 'combo':
				config.type = 'PSMultiValueSpecifier';
				config.DefaultValue = config.default;
				delete config['default'];
				config.Key = config.name;
				delete config['name'];
			break;
			case 'group':
				config.type = 'PSGroupSpecifier';
			break;
	}

	return config;
}


fs.readFile('app-settings.json', function(err, data) {
	if (err)
		throw err;

	data = JSON.parse(data);
	var doc = builder.create();
	var list = doc.begin('plist').att('version', '1.0')
		.ele('dict')
			.ele('key', 'PreferenceSpecifiers')
			.up()
		.ele('array');


	function addSetting(config) {
		var type = config.type || '';
		config = ConfigMap(config);
		var dict = list.ele('dict');

		for (key in config) {
			if (key == "items")
				continue;
			dict.ele('key', ucfirst(key));
			dict.ele('string', config[key]);
		}

		var items = typeof config.items == "object" && config.items.length ? config.items : [];
		if (type == "group") {
			items.forEach(function(sub) {
				addSetting(sub);
			});
		} else if (type == "combo") {
			var v = dict.ele('key', 'Values').up().ele('array'),
			    t = dict.ele('key', 'Titles').up().ele('array');
			items.forEach(function(sub) {
				v.ele('string', sub.value);
				t.ele('string', sub.title || sub.name || sub.value);
			});
		}
	}

	data.forEach(function(el) {
		addSetting(el);
	});


	console.log(doc.toString({ pretty: true }));
});