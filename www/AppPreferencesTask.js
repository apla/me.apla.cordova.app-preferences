
define (function (require, exports, module) {

	var taskBase = require ('task/base');

	var AppPreferenceTask = module.exports = function (config) {
		// there is no options to netinfo class
		this.init (config);
	};

	util.inherits (AppPreferenceTask, taskBase);
	
	util.extend (AppPreferenceTask.prototype, {
		
		get: function () {
			var self  = this;
			
			var args  = {};
			args.key  = this.forKey;
			args.dict = this.inDict;

			if (!this.forKey) {
				self.completed ({forKey: this.forKey, noValue: true});
				return;
			}
			
			console.log('MOBRO PREFERENCE GET PREPARE');

			var successCallback = function (response) {
				var result;
				try {
					result = JSON.parse (response);
				} catch (e) {
					result = response;
				}
				var returnValue = {forKey: self.forKey};
				if (result) {
					returnValue.value = result;
				} else {
					returnValue.noValue = true;
				}
				
				console.log ('MOBRO PREFERENCE GET DONE');
				console.log (returnValue);
				
				self.completed (returnValue);
			};

			var errorCallback = function (error) {
				console.log (error);
				self.completed ({
					forKey: self.forKey,
					noValue: true
				});				
			};
			
			if (device.platform == "BlackBerry" && parseInt(device.version) == 10) {
				self.completed ({
					forKey: self.forKey,
					noValue: true
				});
				return;
			}
			
			var execStatus = cordova.exec (
				successCallback, errorCallback,
				"applicationPreferences", "getSetting", [args]
			);
			
			console.log ('exec status: ' + execStatus);
		},
		set: function () {
			var self = this;
			
			var args   = {};
			args.key   = this.forKey;
			args.dict  = this.inDict;
			args.value = this.value;

			if (!this.forKey || !this.value) {
				self.completed ();
				return;
			}

			console.log ('MOBRO PREFERENCE SET PREPARE');
			console.log (this.value);

			var successCallback = function (response) {
				var result;
				try {
					result = JSON.parse (response);
				} catch (e) {
					result = response;
				}
				self.completed ();
			};

			var errorCallback = function (error) {
				self.failed ({'undefined': true});
				console.log (error);
			};

			if (device.platform == "BlackBerry" && parseInt(device.version) == 10) {
				self.completed ();
				return;
			}
			
			cordova.exec (
				successCallback, errorCallback,
				"applicationPreferences", "setSetting", [args]
			);
		}

	});

	if (device.platform == "windows8") util.extend(AppPreferenceTask.prototype, {

		get: function () {
			var self = this;

			var args = {};
			args.key = this.forKey;
			args.dict = this.inDict || "elmobro";

			if (!this.forKey) {
				self.completed({ forKey: this.forKey, noValue: true });
				return;
			}

			// no support for windows phone 8
			var settings = Windows.Storage.ApplicationData.current.localSettings;

			var hasContainer = settings.containers.hasKey(args.dict);

			var returnValue = { forKey: self.forKey };
			var result;
			if (hasContainer) {
				// Access data in: 
				result = settings.containers.lookup(args.dict).values.hasKey(args.key);
			}

			if (result) {
				returnValue.value = result;
			} else {
				returnValue.noValue = true;
			}

			console.log('MOBRO PREFERENCE GET DONE');
			console.log(returnValue);

			self.completed(returnValue);
		},
		set: function () {

			var self = this;
			var value = JSON.stringify(this.value);

			var key = this.forKey;
			var dict = this.inDict || "elmobro";

			if (!this.forKey || !this.value) {
				self.completed();
				return;
			}

			console.log('MOBRO PREFERENCE SET PREPARE');
			console.log(value);

			// no support for windows phone 8
			var settings = Windows.Storage.ApplicationData.current.localSettings;

			var hasContainer = settings.containers.hasKey(dict);

			// debugger;

			if (!hasContainer) {
				var container = settings.createContainer(dict, Windows.Storage.ApplicationDataCreateDisposition.Always);
			}

			settings.containers[dict].values[key] = value;
			console.log('MOBRO PREFERENCE SET DONE');
			self.completed();

		}

	});

	return AppPreferenceTask;

});