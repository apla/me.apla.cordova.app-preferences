Application preferences Cordova plugin.
-----------------------

Why you should use this plugin?

 * Cordova + Promise interface out of the box
 * Supports many platforms (Android, iOS, Windows and local storage fallback)
 * Have tests
 * Supports simple and complex data structures
 * Supports removal of the keys
 * Have preference pane generator for application (for Android and iOS) and can show native preferences
 * (Alpha) preference change notification #37

For Cordova 3+

Upgrade
---

Please note that plugin id is changed for npm publishing, so if you used
this plugin before cordova@5.0.0, you'll have to reinstall it:

	$ cordova plugin rm me.apla.cordova.app-preferences
	$ cordova plugin add cordova-plugin-app-preferences

Installing
---

From plugin registry:

	$ cordova plugin add cordova-plugin-app-preferences

From the repo:

	$ cordova plugin add https://github.com/apla/me.apla.cordova.app-preferences

From a local clone:

	$ cordova plugin add /path/to/me.apla.cordova.app-preferences/folder


More information:
[Command-line Interface Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface).

[Using Plugman to Manage Plugins](http://cordova.apache.org/docs/en/edge/guide_plugin_ref_plugman.md.html).


Synopsis
---

```javascript

function ok (value) {}
function fail (error) {}

var prefs = plugins.appPreferences;

// cordova interface

// store key => value pair
prefs.store (ok, fail, 'key', 'value');

// store key => value pair in dict (see notes)
prefs.store (ok, fail, 'dict', 'key', 'value');

// fetch value by key (value will be delivered through "ok" callback)
prefs.fetch (ok, fail, 'key');

// fetch value by key from dict (see notes)
prefs.fetch (ok, fail, 'dict', 'key');

// remove value by key
prefs.remove (ok, fail, 'key');

// show application preferences
prefs.show (ok, fail);

// instead of cordova interface you can use promise interface
// you'll receive promise when you won't pass function reference
// as first and second parameter

// fetch the value for a key using promise
prefs.fetch ('key').then (ok, fail);

// support for iOS suites (untested)
var suitePrefs = prefs.iosSuite ("suiteName");
suitePrefs.fetch (...);
suitePrefs.store (...);

```

Platforms
---
1. Native execution on iOS using `NSUserDefaults`
1. Native execution on Android using `android.content.SharedPreferences`
1. Native execution on Windows Phone using `IsolatedStorageSettings.ApplicationSettings`
1. Native execution on Windows 8 using `IsolatedStorageSettings.ApplicationSettings`
1. Execution on BlackBerry10 fallback using `localStorage`

Notes
---
1. iOS, Android and Windows Phone basic values (`string`, `number`, `boolean`) are stored using typed fields.
1. Complex values, such as arrays and objects, are always stored using JSON notation.
1. Dictionaries are supported on iOS and Windows 8 only, so on other platforms instead of using the real dictionary a composite key will be written like `<dict>.<key>`
1. On iOS dictionaries just a key, so appPrefs.store ('dict', 'key', value) and appPrefs.store ('dict', {'key': value}) have same meaning (but different result).

Tests
---
Tests are available in `src/test.js`. After installing plugin you can add test code from this file and then launch `testPlugin()` function.

iOS, Android, BlackBerry 10 and Windows Phone 8 tests pass ok at the moment.

Show Preference pane
---

If you have generated preferences, you can programmatically show preference pane
(Android and iOS at this time). On Android your application show native interface for preferences,
on iOS you'll be switched to the Settings.app with application preferences opened for you.
Either way, you must listen for Cordova resume event to perform preferences synchronization.

Preferences interface generator
---
You can find preliminary version of settings generator in `bin/build-app-settings.js`.

#### Usage: ####

0. Install the settings generator:
`npm install cordova-plugin-app-preferences`

1. Copy example settings JSON to your project folder:
`cp plugins/cordova-plugin-app-preferences/app-settings.json .`

2. Edit JSON to include the controls you need...

3. Generate settings resources with this command:
`node plugins/cordova-plugin-app-preferences/bin/build-app-settings.js`

4. Add generated Settings.bundle to your iOS project.

Supported controls for iOS:
* group
* combo
* switch
* textfield

Supported controls for Android:
* group
* combo
* switch - not tested
* textfield - not tested

TODO: Windows Phone ([guide](http://blogs.msdn.com/b/glengordon/archive/2012/09/17/managing-settings-in-windows-phone-and-windows-8-store-apps.aspx), [docs](https://msdn.microsoft.com/en-US/library/windows/apps/ff769510\(v=vs.105\).aspx))

Credits
---

Original version for iOS:
https://github.com/phonegap/phonegap-plugins/tree/master/iOS/ApplicationPreferences

Another android implementation for cordova 2.x:
https://github.com/macdonst/AppPreferences
