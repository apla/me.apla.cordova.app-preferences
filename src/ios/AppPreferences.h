//
//  applicationPreferences.h
//  
//
//  Created by Tue Topholm on 31/01/11.
//  Copyright 2011 Sugee. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <Cordova/CDV.h>

@interface AppPreferences : CDVPlugin 

- (void)fetch:(CDVInvokedUrlCommand*)command;
- (void)store:(CDVInvokedUrlCommand*)command;
- (NSString*)getValueFromBundle:(NSString*)settingsName;


@end
