var fs = require ('fs');
var exec    = require('child_process').exec;

var ServeMe = require("serve-me");

var dir = './www';
var cmd = '';
var cmdPrepare = '';
var host = '';

if (process.argv[2] === 'ios') {
	dir        = './platforms/ios/www';
	// cmd = 'ios-sim launch ./platforms/ios/build/emulator/HelloCordova.app --log ./console.log --devicetypeid iPhone-6 --exit';
	cmd        = 'cordova emulate ios';
	cmdPrepare = 'cordova prepare ios';
	host       = '127.0.0.1';
} else if (process.argv[2] === 'android') {
	dir        = './platforms/android/assets/www';
	cmd        = 'cordova emulate android';
	cmdPrepare = 'cordova prepare android';
	host       = '10.0.2.2';
}

var serveMe = ServeMe ({
	// debug: true,
	// log: true,
	directory: dir,
	secure: false
});

fs.readFile ("config.xml", function (err, buf) {
	if (err) process.exit (1);
	serveMe.start("0", function() {

		var port = serveMe.server.server.address().port;

		var configXml = buf.toString('utf-8').replace (/<content src="[^"]+/m, '<content src="http://' + host + ':' + port);

		console.log (configXml);

		fs.writeFile ("config.xml", configXml, function () {
			if (err) process.exit (1);
			exec(cmdPrepare, function callback(error, stdout, stderr){
				exec(cmd, function callback(error, stdout, stderr){
					console.log ("cmd done: ", cmd);
					setTimeout (function () {process.exit(1)}, 30000);
				});
			});
		});
	});
})

serveMe.on("http_request", function(data){
	// console.log("http request", data);
});

serveMe.get ("/test/success", function(){
	console.log ("test success");
	process.exit ();
});

serveMe.get ("/test/fail", function (req, res){
	console.log ("test failures: ", req.url);
	process.exit (1);
});
