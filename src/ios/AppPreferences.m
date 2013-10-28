//
//  AppPreferences.m
//  
//
//  Created by Tue Topholm on 31/01/11.
//  Copyright 2011 Sugee. All rights reserved.
//
//  Modified by Ivan Baktsheev, 2012-2013
//
// THIS HAVEN'T BEEN TESTED WITH CHILD PANELS YET.

#import "AppPreferences.h"

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

@implementation AppPreferences

- (void)fetch:(CDVInvokedUrlCommand*)command
{
	
	CDVPluginResult* result = nil;

	NSDictionary* options = [[command arguments] objectAtIndex:0];

	if (!options) {
		result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no options given"];
		[self.commandDelegate sendPluginResult:result callbackId:[command callbackId]];
		return;
	}

	NSString *settingsDict = [options objectForKey:@"dict"];
	NSString *settingsName = [options objectForKey:@"key"];
	
	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
	
	NSMutableDictionary *target = nil;
	
	// NSMutableDictionary *mutable = [[dict mutableCopy] autorelease];
	// NSDictionary *dict = [[mutable copy] autorelease];
	
	if (settingsDict) {
		target = [[defaults dictionaryForKey:settingsDict] mutableCopy];
	}
	
	@try {
	
		//At the moment we only return strings
		//bool: true = 1, false=0
		NSString *returnVar;
		if (target) {
			returnVar = [target objectForKey:settingsName];
		} else {
			returnVar = [defaults stringForKey:settingsName];
		}
		
		if(returnVar == nil) {
			returnVar = [self getSettingFromBundle:settingsName]; //Parsing Root.plist
			
//			if (returnVar == nil)
//				@throw [NSException exceptionWithName:nil reason:@"Key not found" userInfo:nil];;
		}
		result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:returnVar];

	} @catch (NSException * e) {

		result = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT messageAsString:[e reason]];
	
	} @finally {
	
		[self.commandDelegate sendPluginResult:result callbackId:[command callbackId]];
	}
}

- (void)store:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* result;

	NSDictionary* options = [[command arguments] objectAtIndex:0];

	if (!options) {
		result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no options given"];
		[self.commandDelegate sendPluginResult:result callbackId:[command callbackId]];
		return;
	}

	NSString *settingsDict  = [options objectForKey:@"dict"];
    NSString *settingsName  = [options objectForKey:@"key"];
    NSString *settingsValue = [options objectForKey:@"value"];

	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
	
	NSMutableDictionary *target;

	// NSMutableDictionary *mutable = [[dict mutableCopy] autorelease];
	// NSDictionary *dict = [[mutable copy] autorelease];
	
	if (settingsDict) {
		target = [[defaults dictionaryForKey:settingsDict] mutableCopy];
		if (!target) {
			target = [[NSMutableDictionary alloc] init];
#if !__has_feature(objc_arc)
			[target autorelease];
#endif
		}
	}
		
    @try {
	
		if (target) {
			[target setObject:settingsValue forKey:settingsName];
			[defaults setValue:target forKey:settingsDict];
		} else {
			[defaults setObject:settingsValue forKey:settingsName];
		}
		
		[defaults synchronize];

        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
			
    } @catch (NSException * e) {
	
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT messageAsString:[e reason]];
    
	} @finally {
	
        [self.commandDelegate sendPluginResult:result callbackId:[command callbackId]];
    }
}
/*
  Parsing the Root.plist for the key, because there is a bug/feature in Settings.bundle
  So if the user haven't entered the Settings for the app, the default values aren't accessible through NSUserDefaults.
*/


- (NSString*)getSettingFromBundle:(NSString*)settingsName
{
	NSString *pathStr = [[NSBundle mainBundle] bundlePath];
	NSString *settingsBundlePath = [pathStr stringByAppendingPathComponent:@"Settings.bundle"];
	NSString *finalPath = [settingsBundlePath stringByAppendingPathComponent:@"Root.plist"];
	
	NSDictionary *settingsDict = [NSDictionary dictionaryWithContentsOfFile:finalPath];
	NSArray *prefSpecifierArray = [settingsDict objectForKey:@"PreferenceSpecifiers"];
	NSDictionary *prefItem;
	for (prefItem in prefSpecifierArray)
	{
		if ([[prefItem objectForKey:@"Key"] isEqualToString:settingsName]) 
			return [prefItem objectForKey:@"DefaultValue"];		
	}
	return nil;
	
}
@end
