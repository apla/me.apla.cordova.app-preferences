/**
 * Decode a custom config file format into the elements needed to build iOS and Android preference xml
 *
 *
 */


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
            element.type = 'PSGroupSpecifier';
        }
        else {     
            element.DefaultValue = config['default'];

            element.Key = config['name'];

            switch (config.type) {

                case 'textfield':
                    element.type = 'PSTextFieldSpecifier';                
                    break;

                case 'switch':
                    element.type = 'PSToggleSwitchSpecifier';
                    break;

                case 'combo':
                    element.type = 'PSMultiValueSpecifier';

                    element.titles = [];
                    element.values = [];
                    config.items.forEach(function(a) {
                        element.values.push(a.id || a.value);
                        element.titles.push(a.title || a.name);
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


module.exports = {
    iosConfigMap: iosConfigMap,
    iosBuildItems: iosBuildItems
};

