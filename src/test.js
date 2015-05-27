function testPlugin () {
var tests = {
	"bool-test": true,
	"false-test": false,
	"float-test": 123.456,
	"int-test": 1,
	"zero-test": 0,
	"string-test": "xxx",
	"empty-string-test": "xxx",
	"obj-test": {a: "b"},
	"arr-test": ["a", "b"],
	"empty-arr-test": []
};

var fail = 0;
var pass = 0;

var nonExistingKeyName = 'this-key-must-not-exists';

var appp = plugins.appPreferences;
appp.fetch (function (ok) {
	if (ok === null) {
		pass++;
		appp.store (function (ok) {
			pass++;
			appp.fetch (function (ok) {
				if (ok !== null && ok) {
					pass++;
				} else {
					fail ++;
				}
				appp.remove (function (ok) {
					pass++;
				}, function (err) {
					fail++;
				}, nonExistingKeyName);
			}, function (err) {
				fail++;
			}, nonExistingKeyName);
		}, function (err) {
			fail++;
		}, nonExistingKeyName, true);
	} else {
		appp.remove (function (ok) {
			pass++;
		}, function (err) {
			fail++;
		}, nonExistingKeyName);
		fail ++;
	}
}, function (err) {
	fail ++;
}, nonExistingKeyName);

appp.fetch (function (ok) {
	if (ok === null) {
		pass++;
	} else {
		fail ++;
	}
}, function (err) {
	fail ++;
}, "dict2", nonExistingKeyName);

for (var testK in tests) {
	(function (testName, testValue) {
		console.log ('trying to store', testName);
		appp.store (function (ok) {
			console.log ('stored', testName);
			pass ++;
			appp.fetch (function (ok) {
				if (ok == testValue || (typeof testValue == "object" && JSON.stringify (ok) == JSON.stringify (testValue)))
					pass ++;
				else {
					console.error ('fetched incorrect value for ' + testName + ': expected ' + JSON.stringify (testValue) + ' got ' + JSON.stringify (ok));
					fail ++;
				}
			}, function (err) {
				console.error ('fetch value failed for ' + testName + ' and value ' + testValue);
				fail ++;
			}, testName);
		}, function (err) {
			console.error ('store value failed for ' + testName + ' and value ' + testValue);
			fail ++;
		}, testName, testValue);
		console.log ('trying to store', "dict.x" + testName);
		appp.store (function (ok) {
			console.log ('stored', "dict.x" + testName);
			pass ++;
			appp.fetch (function (ok) {
				if (ok == testValue || (typeof testValue == "object" && JSON.stringify (ok) == JSON.stringify (testValue)))
					pass ++;
				else {
					console.error ('fetched incorrect value for dict.x' + testName + ': expected ' + JSON.stringify (testValue) + ' got ' + JSON.stringify (ok));
					fail ++;
				}
			}, function (err) {
				console.error ('fetch value failed for ' + "dict.x" + testName + ' and value ' + testValue);
				fail ++;
			}, "dict", "x" + testName);
		}, function (err) {
			console.error ('store value failed for ' + "dictx" + testName + ' and value ' + testValue);
			fail ++;
		}, "dict", "x" + testName, testValue);

	}) (testK, tests[testK]);
}

setTimeout (function () {
	console.log (pass + ' tests passed');
	if (fail)
		console.error (fail + ' tests failed');
}, 1000);
}
