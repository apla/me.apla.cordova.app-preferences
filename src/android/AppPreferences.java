package me.apla.cordova;

import java.util.Iterator;
import java.util.Map;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.preference.PreferenceManager;

public class AppPreferences extends CordovaPlugin {

    private static final String LOG_TAG = "AppPrefs";
    private static final int NO_PROPERTY = 0;
    private static final int NO_PREFERENCE_ACTIVITY = 1;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        PluginResult.Status status = PluginResult.Status.OK;
        String result = "";

        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this.cordova.getActivity());

        try {
            if (action.equals("get")) {
                String key = args.getString(0);
                if (sharedPrefs.contains(key)) {
                    String obj = (String) sharedPrefs.getAll().get(key);
                    // JSONObject jsonValue = new JSONObject((Map) obj);
                    callbackContext.sendPluginResult(new PluginResult(status, obj.toString()));
                } else {
                    callbackContext.sendPluginResult(createErrorObj(NO_PROPERTY, "No such property called " + key));
                }
            } else if (action.equals("set")) {
                String key = args.getString(0);
                String value = args.getString(1);
                Editor editor = sharedPrefs.edit();
                editor.putString(key, value);
                callbackContext.sendPluginResult(new PluginResult(status, editor.commit()));               
            } else if (action.equals("load")) {
                JSONObject obj = new JSONObject();
                Map prefs = sharedPrefs.getAll();
                Iterator it = prefs.entrySet().iterator();
                while (it.hasNext()) {
                    Map.Entry pairs = (Map.Entry)it.next();
                    obj.put(pairs.getKey().toString(), pairs.getValue().toString());
                }
                callbackContext.sendPluginResult(new PluginResult(status, obj));
            } else if (action.equals("show")) {
                String activityName = args.getString(0);
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setClassName(this.cordova.getActivity(), activityName);
                try {
                    this.cordova.getActivity().startActivity(intent);
                } catch (ActivityNotFoundException e) {
                    callbackContext.sendPluginResult(createErrorObj(NO_PREFERENCE_ACTIVITY, "No preferences activity called " + activityName));
                }
            } else if (action.equals("clear")) {
            	Editor editor = sharedPrefs.edit();
            	editor.clear();
            	callbackContext.sendPluginResult(new PluginResult(status, editor.commit()));
            } else if (action.equals("remove")) {
            	String key = args.getString(0);            	
            	if (sharedPrefs.contains(key)) {
            		Editor editor = sharedPrefs.edit();
                	editor.remove(key);
                	editor.commit();
                	callbackContext.sendPluginResult(new PluginResult(status, editor.commit()));
                } else {
                    callbackContext.sendPluginResult(createErrorObj(NO_PROPERTY, "No such property called " + key));
                }
            }
            return true;
        } catch (JSONException e) {
            status = PluginResult.Status.JSON_EXCEPTION;
        }
        callbackContext.sendPluginResult(new PluginResult(status, result));
        return false;
    }

    private PluginResult createErrorObj(int code, String message) throws JSONException {
        JSONObject errorObj = new JSONObject();
        errorObj.put("code", code);
        errorObj.put("message", message);
        return new PluginResult(PluginResult.Status.ERROR, errorObj);
    }

}
