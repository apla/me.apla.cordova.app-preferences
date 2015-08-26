/**
 * Decode a custom config file format into the elements needed to build iOS and Android preference xml
 *
 *
 */

var libxml  = require('libxmljs');


function ucfirst(s) {
	return s.charAt(0).toUpperCase() + s.substring(1);
}

var commonMappings = {
	title: {
		ios: "Title",
		android: "@android:title"
	},
	key: {
		ios: "Key",
		android: "@android:key"
	},
	default: {
		ios: "DefaultValue",
		android: "@android:defaultValue"
	},
	description: {
		ios: "FooterText",
		android: "@android:summary"
	},
};

var mappings = {
	group: {
		ios: "PSGroupSpecifier",
		android: "PreferenceCategory",
		attrs: {
			description: commonMappings.description,
			title: commonMappings.title
		}
	},
	selectNotSupported: {
		ios: "PSMultiValueSpecifier",
		android: "MultiSelectListPreference",
		attrs: {
			key:     commonMappings.key,
			title:   commonMappings.title,
			default: commonMappings.default,
		}
	},
	radio: {
		ios: "PSRadioGroupSpecifier",
		android: "ListPreference",
		required: ["title", "key", "default"],
		attrs: {
			key:     commonMappings.key,
			title:   commonMappings.title,
			default: commonMappings.default,
			description: commonMappings.description,
		},
		fixup: {
			ios: function (element, config) {
				element.Titles = [];
				element.Values = [];
				config.items.forEach(function(a) {
					element.Values.push(a.id || a.value);
					element.Titles.push(a.title || a.name);
				});
			},
			android: function (element, config) {
				var titles = [], values = [];

				config.items.forEach(function(item) {

					titles.push(item.name || item.title);
					values.push(item.id || item.value);
				});

				element.strings = {
					name: config.name,
					titles: titles,
					values: values
				};

				element.attrs['android:entries'] = '@array/apppreferences_' + config.name;
				element.attrs['android:entryValues'] = '@array/apppreferences_' + config.name + 'Values';
			}
		}
	},
	toggle: {
		ios: "PSToggleSwitchSpecifier",
		android: "SwitchPreference",
		types: "boolean",
		required: ["title", "key", "default"],
		attrs: {
			key:     commonMappings.key,
			title:   commonMappings.title,
			default: commonMappings.default,
		}
	},
	textfield: {
		ios: "PSTextFieldSpecifier",
		android: "EditTextPreference",
		types: "string",
		required: ["key"],
		attrs: {
			keyboard: {
				android: "@android:inputType",
				ios: "KeyboardType",
				value: {
					// Alphabet , NumbersAndPunctuation , NumberPad , URL , EmailAddress
					// text, number, textUri, textEmailAddress
					// ios: https://developer.apple.com/library/ios/documentation/PreferenceSettings/Conceptual/SettingsApplicationSchemaReference/Articles/PSTextFieldSpecifier.html#//apple_ref/doc/uid/TP40007011-SW1
					// android is little weird http://developer.android.com/reference/android/widget/TextView.html#attr_android:inputType
					number: {ios: "NumberPad", android: "number"},
					text: {ios: "Alphabet", android: "text"},
					uri: {ios: "URL", android: "textUri"},
					email: {ios: "EmailAddress", android: "textEmailAddress"}
				}
			},
			// need a different handling for ios and android
			// IsSecure
			// AutocapitalizationType
			// AutocorrectionType
			key:     commonMappings.key,
			title:   commonMappings.title,
			default: commonMappings.default,
		}
	},
	sliderNotSupported: {
		// slider is not supported for android
		// iOS:
		//@TODO: PSSliderSpecifier
		//Key
		//DefaultValue
		//MinimumValue
		//MaximumValue
	},
	titleNotSupported: {
		// please use group for this, ios only
		// TODO: probably it is good idea to add title automatically:
		// 1. if you want to show wide text input without title
		// 2. for a slider
		// 3. to simulate android summary for fields
	}
};

function iosConfigMap(config) {
	var platformName = "ios";

	var element = {};

	if (!config.type) {
		throw "no type defined for "+JSON.stringify (config, null, "\t");
	}

	var mapping = mappings[config.type];

	if (!mapping)
		throw "no mapping for "+ config.type;

	element.Type = mapping[platformName];

	if (mapping.required) {
		mapping.required.forEach (function (k) {
			if (!(k in config)) {
				throw 'ERROR: attribute "'+ k + '" not found for ' + config.title + ' (type: ' + config.type + ')';
			}
		});
	}

	if (mapping.attrs) {
		for (var attrName in mapping.attrs) {
			if (!config.hasOwnProperty(attrName))
				continue;
			var attrConfig = mapping.attrs[attrName];
			var elementKey = attrConfig[platformName];
			if (attrConfig.value) {
				if (!attrConfig.value[config[attrName]] || !attrConfig.value[config[attrName]][platformName])
					throw "no mapping for type: "+ config.type + ", attr: " + attrName + ", value: " + config[attrName];
				element[elementKey] = attrConfig.value[config[attrName]][platformName];
			} else {
				element[elementKey] = config[attrName];
			}
		}
	}

	if (mapping.fixup && mapping.fixup[platformName]) {
		mapping.fixup[platformName] (element, config, mapping);
	}

	return element;
}


// build iOS settings bundle
function iosBuildItems(data) {

	var items = [];
	for (var i=0, l=data.length; i<l; i++) {

		var src = data[i];

		items.push(iosConfigMap(src));

		if (src.type == 'group') {
			src.items.forEach(function(s) {
				items.push(iosConfigMap(s));
			});
		}
	}

	return items;
}


function androidConfigMap(config) {
	var platformName = "android";

	var element = {
		attrs: {},
		children: []
	};

	if (!config.type) {
		throw "no type defined for "+JSON.stringify (config, null, "\t");
	}

	var mapping = mappings[config.type];

	if (!mapping)
		throw "no mapping for "+ config.type;

	element.tagname = mapping[platformName];

	if (mapping.required) {
		mapping.required.forEach (function (k) {
			if (!(k in config)) {
				throw ['attribute', k, 'not found for', config.title, '(' + config.type + ')'].join (" ");
			}
		});
	}

	if (mapping.attrs) {
		for (var attrName in mapping.attrs) {
			if (!config.hasOwnProperty(attrName))
				continue;
			var attrConfig = mapping.attrs[attrName];
			var elementKey = attrConfig[platformName];

			var targetCheck = elementKey.split ('@');
			var targetAttr;
			if (targetCheck.length === 2 && targetCheck[0] === '') {
				targetAttr = targetCheck[1];
				if (!element.attrs)
					element.attrs = {};
				element.attrs[targetAttr] = [];
			}
			if (attrConfig.value) {
				if (!attrConfig.value[config[attrName]] || !attrConfig.value[config[attrName]][platformName])
					throw "no mapping for type: "+ config.type + ", attr: " + attrName + ", value: " + config[attrName];
				if (targetAttr)
					element.attrs[targetAttr].push (attrConfig.value[config[attrName]][platformName]);
				else
					element[elementKey] = attrConfig.value[config[attrName]][platformName]
			} else {

				if (targetAttr)
					element.attrs[targetAttr].push (config[attrName]);
				else
					element[elementKey] = config[attrName];
			}
		}
	}

	if (mapping.fixup && mapping.fixup[platformName]) {
		mapping.fixup[platformName] (element, config, mapping);
	}

	return element;
}

function androidBuildNode(parent, config, stringsArrays) {

	for (var attr in config.attrs) {
		if (config.attrs[attr] && config.attrs[attr].constructor === Array)
			config.attrs[attr] = config.attrs[attr].join ('|');
	}
	var newNode = parent
		.node(config.tagname)
		.attr(config.attrs);

	if (config.strings) {
		console.log("will push strings array "+JSON.stringify(config.strings));
		stringsArrays.push(config.strings);
	}

	if (config.children) {
		config.children.forEach(function(child){
			androidBuildNode(newNode, child, stringsArrays);
		});
	}
}


// build Android settings XML
function androidBuildSettings(configJson) {

	var preferencesDocument = new libxml.Document();
	var screenNode = preferencesDocument
		.node('PreferenceScreen')
		.attr({'xmlns:android': 'http://schemas.android.com/apk/res/android'});

	var stringsArrays = [];

	configJson.forEach(function(preference) {
		var node = androidConfigMap(preference);

		if (preference.type === 'group' && preference.items && preference.items.length) {
			preference.items.forEach(function(childNode) {
				node.children.push(androidConfigMap(childNode));
			});
		}

		androidBuildNode(screenNode, node, stringsArrays);
	});

	return {
		preferencesDocument: preferencesDocument,
		stringsArrays: stringsArrays
	};
}

module.exports = {
	iosConfigMap: iosConfigMap,
	iosBuildItems: iosBuildItems,
	androidConfigMap: androidConfigMap,
	androidBuildSettings: androidBuildSettings
};

