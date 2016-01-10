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
	directory: "./www",
	secure: false
});

serveMe.start(50000, function(){
	exec(cmd, function callback(error, stdout, stderr){
		setTimeout (function () {process.exit(1)}, 20000);
	});
});

serveMe.get ("/test/success", function(){
	process.exit ();
});

serveMe.get ("/test/fail", function(){
	process.exit (1);
});
