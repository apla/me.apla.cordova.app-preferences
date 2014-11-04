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
        var attr = {
            'android:title': config.title,
            'android:key': config.name,
            'android:defaultValue': config.default
        };

        switch (config.type) {
            
            case 'textfield':
                tagname = 'EditTextPreference';
                break;
                
            case 'switch':
                tagname = 'CheckBoxPreference';
                break;
                
            case 'combo':

                tagname = 'ListPreference';
                
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

            break;
        }
        
        return {
            tagname: tagname,
            atts: attr,
            strings: strings
        };

    }
}


function androidBuildNode(parent, config) {
    
        var newNode = parent
            .node(config.tagname)
            .attr(config.atts);
        
        if (config.children) {
            config.children.forEach(function(child){
                androidBuildNode(newNode, child);
            });
        }
}


// build Android settings XML
function androidBuildNodes(configJson) {
	var strings = [];

	var doc = new libxml.Document();
	var screenNode = doc
		.node('PreferenceScreen')
		.attr({'xmlns:android': 'http://schemas.android.com/apk/res/android'});


	configJson.forEach(function(item) {
		var node = androidConfigMap(item);
        
        androidBuildNode(screenNode, node);
	});
    
    return doc;
}

module.exports = {
    iosConfigMap: iosConfigMap,
    iosBuildItems: iosBuildItems,
    androidConfigMap: androidConfigMap,
    androidBuildNodes: androidBuildNodes
};

