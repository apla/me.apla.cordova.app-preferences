using System;
using System.Diagnostics;
using System.IO.IsolatedStorage;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Collections.Generic;

namespace WPCordovaClassLib.Cordova.Commands
{

    // http://msdn.microsoft.com/en-us/library/microsoft.phone.net.networkinformation(v=VS.92).aspx
    // http://msdn.microsoft.com/en-us/library/microsoft.phone.net.networkinformation.devicenetworkinformation(v=VS.92).aspx

    public class AppPreferences : BaseCommand
    {
        public AppPreferences()
        {
        }

		[DataContract]
		public class AppPreferenceArgs
		{
			[DataMember(Name = "key", IsRequired = true)]
			public string key;
			[DataMember (Name = "dict", IsRequired = false)]
			public string dict;
			[DataMember (Name = "value", IsRequired = false)]
			public string value;

			public string fullKey () {
				if (this.dict != null) {
					return string.Concat(this.dict, '.', this.key);
				} else {
					return this.key;
				}
			}
		}

        public void getValue (string argsString)
        {
			AppPreferenceArgs preference;
            string value;
			string optionsString = JSON.JsonHelper.Deserialize<string[]> (argsString)[0];
			//BrowserOptions opts = JSON.JsonHelper.Deserialize<BrowserOptions>(options);

            try {
				preference = JSON.JsonHelper.Deserialize<AppPreferenceArgs> (optionsString);
                IsolatedStorageSettings userSettings = IsolatedStorageSettings.ApplicationSettings;
				
                userSettings.TryGetValue<string> (preference.fullKey(), out value);
            } catch (NullReferenceException) {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                return;
            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                return;
            }
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, value));
        }

        public void setValue (string argsString)
        {
			AppPreferenceArgs preference;
			string optionsString = JSON.JsonHelper.Deserialize<string[]> (argsString)[0];
			//BrowserOptions opts = JSON.JsonHelper.Deserialize<BrowserOptions>(options);

			try {
				preference = JSON.JsonHelper.Deserialize<AppPreferenceArgs> (optionsString);
				IsolatedStorageSettings userSettings = IsolatedStorageSettings.ApplicationSettings;
                userSettings.Add(preference.fullKey(), preference.value);
                userSettings.Save();
            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                return;
            }
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, ""));
        }
    }
}
