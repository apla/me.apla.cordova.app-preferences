var ServeMe = require("serve-me");
var exec    = require('child_process').exec;

var dir = './www';
var cmd = '';

if (process.argv[2] === 'ios') {
	dir = './platforms/ios/www';
	cmd = 'ios-sim launch ./platforms/ios/build/emulator/HelloCordova.app --log ./console.log --devicetypeid iPhone-6 --exit';
}

var serveMe = ServeMe ({
	debug: true,
	log: true,
	directory: dir,
	secure: false
});

serveMe.start(50000, function(){
	exec(cmd, function callback(error, stdout, stderr){
		console.log ("command done");
		// setTimeout (function () {process.exit(1)}, 20000);
	});
});

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
