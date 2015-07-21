var mp = require('../lib/mobile_preferences.js');

describe("mobile_preferences.js module", function() {

	it("exists", function() {
		expect(mp).not.toBeNull();
	});

	describe("ios functions", function() {

		it("maps a texfield control", function() {

			var config = {
				type: "textfield",
				default: "test_value",
				key: "test_key",
				keyboard: "email"
			};

			var element = mp.iosConfigMap(config);

			expect(element.Key).toEqual(config.key);
			expect(element.DefaultValue).toEqual(config.default);
			expect(element.KeyboardType).toEqual("EmailAddress");
		});

		it("builds array of ios preference items", function() {

			var configs = [{
				type: "textfield"
			},{
				type: "textfield"
			}];

			var items = mp.iosBuildItems(configs);
			expect(items.length).toEqual(2);
		});

		it("flattens group items", function() {

			var configs = [{
				type: "group",
				items: [
					{ type: "textfield", key: "child 1" },
					{ type: "textfield", key: "child 2" }
				]
			}];

			var items = mp.iosBuildItems(configs);
			expect(items.length).toEqual(3);
		});

	});


	describe("android functions", function() {

		it("generates group items", function() {

			var config = {
				type: "group",
				title: "test group",
				items: [
					{ type: "textfield", key: "child 1" },
					{ type: "textfield", key: "child 2" }
				]
			};

			var item = mp.androidConfigMap(config);
			console.log(item);
			expect(item.tagname).toEqual('PreferenceCategory');
			expect(item.children).not.toBeNull();
		});

		it("maps a texfield control", function() {

			var config = {
				type: "textfield",
				default: "test_value",
				key: "test_key"
			};

			var element = mp.androidConfigMap(config);

			expect(element.tagname).toEqual('EditTextPreference');
			expect(element.atts).not.toBeNull();
		});

		it("builds the item array", function() {

			var configs = [{
				type: "group",
				title: "test group",
				items: [
					{ type: "textfield", key: "child 1", title: "child 1" },
					{ type: "textfield", key: "child 2", title: "child 2" }
				]
			}];

			var prefsDocuments = mp.androidBuildSettings(configs);
			console.log(prefsDocuments);
			expect(prefsDocuments.preferencesDocument).not.toBeNull();
			expect(prefsDocuments.stringsArrays).not.toBeNull();
		});

		it ("extended radio play", function () {
			var configs = [
				{
					"type":"group",
					"title":"Measurement Units",
					"key":"measurement_units",
					"description":"Define which measurement unit is prefered",
					"items":[
						{
							"type":"radio",
							"items":[
								{
									"value":"kilometers_litres",
									"title":"Use kilometers / litres"
								},
								{
									"value":"miles_gallons",
									"title":"Use miles / gallons"
								}
							],
							"default":"kilometers_litres",
							"title":"Measurement unit",
							"key":"measurement_unit",
							"name":"measurementunit"
						}
					]
				}
			];

			var prefsDocuments = mp.androidBuildSettings(configs);
			console.log(prefsDocuments);
			expect(prefsDocuments.preferencesDocument).not.toBeNull();
			expect(prefsDocuments.stringsArrays).not.toBeNull();
		});
	});

});
