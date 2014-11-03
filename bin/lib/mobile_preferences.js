/**
 * Decode a custom config file format into the elements needed to build iOS and Android preference xml
 *
 *
 */

var libxml  = require('libxmljs');


function ucfirst(s) {
    return s.charAt(0).toUpperCase() + s.substring(1);
}


function iosConfigMap(config) {
// iOS
// https://developer.apple.com/library/ios/documentation/cocoa/Conceptual/UserDefaults/Preferences/Preferences.html
/*

mkdir Settings.bundle
cd Settings.bundle
touch Root.plist
mkdir en.lproj
cd en.lproj
touch Root.strings

Identifier

PSGroupSpecifier
Type
Title
FooterText

PSToggleSwitchSpecifier
Title
Key
DefaultValue

PSSliderSpecifier
Key
DefaultValue
MinimumValue
MaximumValue

PSTitleValueSpecifier
Title
Key
DefaultValue

PSTextFieldSpecifier
Title
Key
DefaultValue
IsSecure
KeyboardType (Alphabet , NumbersAndPunctuation , NumberPad , URL , EmailAddress)
AutocapitalizationType
AutocorrectionType

PSMultiValueSpecifier
Title
Key
DefaultValue
Values
Titles

PSRadioGroupSpecifier
Title
FooterText???
Key
DefaultValue
Values
Titles


*/
    var element = {};

    if (config.type) {
        
        if (config.type == 'group') {
            element.Type = 'PSGroupSpecifier';
        }
        else {     
            element.DefaultValue = config['default'];

            element.Key = config['name'];
            element.Title = ucfirst(config['name']);

            switch (config.type) {

                case 'textfield':
                    element.Type = 'PSTextFieldSpecifier';                
                    break;

                case 'switch':
                    element.Type = 'PSToggleSwitchSpecifier';
                    break;

                case 'combo':
                    element.Type = 'PSMultiValueSpecifier';

                    element.Titles = [];
                    element.Values = [];
                    config.items.forEach(function(a) {
                        element.Values.push(a.id || a.value);
                        element.Titles.push(a.title || a.name);
                    });

                    break;
            }
        }
    }
/*
	Object.keys(config).forEach(function(k) {
		var uc = ucfirst(k);
		config[uc] = config[k];
		if (uc != k) {
			delete config[k];
        }
	})
*/
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


function androidConfigMap(parent, config) {

    var strings = [];

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

module.exports = {
    iosConfigMap: iosConfigMap,
    iosBuildItems: iosBuildItems,
    androidConfigMap: androidConfigMap
};

