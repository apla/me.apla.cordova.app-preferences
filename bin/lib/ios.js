var mappings = require("./mappings"),
	platformName = "ios",
	platformDir = 'platforms/ios/',
	xcodeprojRegex = /\.xcodeproj$/i;
	
module.exports = function (Q, fs, path, plist, xcode) {
	
	function mapConfig(config) {
		var element = {};
	
		if (!config.type) {
			throw "no type defined for "+JSON.stringify (config, null, "\t");
		}
	
		var mapping = mappings[config.type];
	
		if (!mapping)
			throw "no mapping for "+ config.type;
	
		element.Type = mapping[platformName];
	
		if (mapping.required) {
			mapping.required.forEach (function (k) {
				if (!(k in config)) {
					throw 'ERROR: attribute "'+ k + '" not found for ' + config.title + ' (type: ' + config.type + ')';
				}
			});
		}
	
		if (mapping.attrs) {
			for (var attrName in mapping.attrs) {
				if (!config.hasOwnProperty(attrName))
					continue;
				var attrConfig = mapping.attrs[attrName];
				var elementKey = attrConfig[platformName];
				if (attrConfig.value) {
					if (!attrConfig.value[config[attrName]] || !attrConfig.value[config[attrName]][platformName])
						throw "no mapping for type: "+ config.type + ", attr: " + attrName + ", value: " + config[attrName];
					element[elementKey] = attrConfig.value[config[attrName]][platformName];
				} else {
					element[elementKey] = config[attrName];
				}
			}
		}
	
		if (mapping.fixup && mapping.fixup[platformName]) {
			mapping.fixup[platformName] (element, config, mapping);
		}
	
		return element;
	}
	
	// build iOS settings bundle
	function buildItems(data) {
	
		var items = [];
		for (var i=0, l=data.length; i<l; i++) {
	
			var src = data[i];
	
			items.push(mapConfig(src));
	
			if (src.type == 'group') {
				src.items.forEach(function(s) {
					items.push(mapConfig(s));
				});
			}
		}
	
		return items;
	}
	
	function parseXCode(projPath) {
		var defer = Q.defer(),
			proj = xcode.project(projPath);
		
		proj.parse(function (err) {
			err ?
				defer.reject(err) :
				defer.resolve(proj);
		});
		
		return defer.promise;
	}
	
	function buildXCode() {
		return fs.find(platformDir, xcodeprojRegex).then(function(projPath) {
			projPath = path.join(projPath, "project.pbxproj");
			
			return parseXCode(projPath)
				.then(function (proj) { 
					proj.addResourceFile('Settings.bundle'); 
					return proj.writeSync(); 
				})
				.then(function (content) {
					return fs.writeFile(projPath, content);
				});
		});
	}
	
	function build(config) {
		var plistXml = plist.build({ PreferenceSpecifiers: buildItems(config) });
		
		return fs.exists('platforms/ios')
			// Write settings plist
			.then(function () { return fs.mkdir('platforms/ios/Settings.bundle'); })
			.then(function () { return fs.writeFile('platforms/ios/Settings.bundle/Root.plist', plistXml); })
			
			// Write localization resource file
			.then(function () { return fs.mkdir('platforms/ios/Settings.bundle/en.lproj'); })
			.then(function () { return fs.writeFile('platforms/ios/Settings.bundle/en.lproj/Root.strings', '/* */'); })
			
			// Add Settings plist to xcodeproj
			.then(buildXCode)
			
			.then(function () { console.log('ios settings bundle was successfully generated'); })
			.catch(function (err) {
				if (err.code === 'NEXIST') {
					console.log("Platform ios not found: skipping");
					return;
				}
				
				throw err;
			});
	}
	
	return {
		mapConfig: mapConfig,
		buildItems: buildItems,
		build: build
	};
};