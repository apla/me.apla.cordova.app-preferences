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
@TODO: 

PSGroupSpecifier
Type
Title
@TODO: FooterText

@TODO: PSSliderSpecifier
Key
DefaultValue
MinimumValue
MaximumValue

PSTextFieldSpecifier
Title
Key
DefaultValue
@TODO: 
IsSecure
KeyboardType (Alphabet , NumbersAndPunctuation , NumberPad , URL , EmailAddress)
AutocapitalizationType
AutocorrectionType

@TODO: PSRadioGroupSpecifier
Title
FooterText???
Key
DefaultValue
Values
Titles

*/
    var element = {
        Title: config['title']
    };

    if (config.type) {
        
        if (config.type == 'group') {
            element.Type = 'PSGroupSpecifier';
        }
        else {     
            element.DefaultValue = config['default'];

            element.Key = config['name'];

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
    
    var strings = [];

    if (config.type == 'group') {
        var node = {
            tagname: 'PreferenceCategory',
            atts: {
                'android:title': config.name || config.title
            },
            children: []
        };

        config.items.forEach(function(item) {
            node.children.push(androidConfigMap(item));
        });
        
        return node;

    } else {

        var tagname;
        var node = {
            atts: {
                'android:title': config.title,
                'android:key': config.name,
                'android:defaultValue': config.default
            }
        };

        switch (config.type) {
            
            case 'textfield':
                node.tagname = 'EditTextPreference';
                break;
                
            case 'switch':
                node.tagname = 'CheckBoxPreference';
                break;
                
            case 'combo':

                node.tagname = 'ListPreference';
                                
                var titles = [], values = [];

                config.items.forEach(function(item) {
                    
                    titles.push(item.name || item.title);
                    values.push(item.id || item.value);
                });

                node.strings = {
                    name: config.name,
                    titles: titles,
                    values: values
                };

                node.atts['android:entries'] = '@apppreferences_strings/' + config.name;
                node.atts['android:entryValues'] = '@apppreferences_strings/' + config.name + 'Values';

            break;
        }

        return node;
    }
}


function androidBuildNode(parent, config, stringsArrays) {
    
    var newNode = parent
        .node(config.tagname)
        .attr(config.atts);
    
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

	configJson.forEach(function(item) {
		var node = androidConfigMap(item);
        
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

