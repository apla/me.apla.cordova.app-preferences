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

    if (config.type) {
        
        if (config.type == 'group') {
            config.type = 'PSGroupSpecifier';
        }
        else {     
            config.DefaultValue = config['default'];
            delete config['default'];

            config.Key = config.name;
            delete config['name'];

            switch (config.type) {

                case 'textfield':
                    config.type = 'PSTextFieldSpecifier';                
                    break;

                case 'switch':
                    config.type = 'PSToggleSwitchSpecifier';
                    break;

                case 'combo':
                    config.type = 'PSMultiValueSpecifier';

                    config.titles = [];
                    config.values = [];
                    config.items.forEach(function(a) {
                        config.values.push(a.id || a.value);
                        config.titles.push(a.title || a.name);
                    });
                    delete config.items;
                    break;
            }
        }
    }

	Object.keys(config).forEach(function(k) {
		var uc = ucfirst(k);
		config[uc] = config[k];
		if (uc != k)
			delete config[k];
	})

	return config;
}




module.exports.iosConfigMap = iosConfigMap;