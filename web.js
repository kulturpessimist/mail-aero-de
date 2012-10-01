// _require_ all the libraries!
var express = require('express'),
	mail	= require('nodemailer'),
	_		= require('underscore'),
	fs		= require('fs'),
	path	= require('path'),
	sprintf = require('sprintf').sprintf,
	crypto	= require('crypto'),
	// a server with express... ah such a nice library!
	app = express.createServer(express.logger());
// _configure_ all the parameters!
app.configure(function(){
	global.defaults = {};
	//	lets parse the config.json for name, version and dependencies	
	var _u	= JSON.parse( fs.readFileSync( path.resolve(__dirname + '/config.json') ,'utf-8') );
	_.extend(global.defaults, _u);
	app.use(express.methodOverride());
	// static files for our "frontend"
	app.use(express.static(__dirname + '/public'));
	// dynamic views
	app.set('views', __dirname + '/views');
	// and last but not least the body Parser for our post route
	app.use(express.bodyParser());
});
// now exactly the same for post requests 
// with optional parameters for the padding
app.post('/api/:token?', function(request, response) {
	var token = request.params.token || '';
	// email parameters
	var mail = {
		"from": request.params.from || "mail.aæro.de",
		"to": request.params.to,
		"cc": request.params.cc || "",
		"bcc": request.params.bcc || "",
		"subject": request.params.subject,
		"html": res.render('simple-basic',{ mail:request.params || "" }),
		"generateTextFromHTML": request.params.generateTextFromHTML || true
		//,"headers": {},
		//"attachments": []
	}
	// do we have a token?
	if(global.defaults.hasOwnProperty(token)){
		var smtp = nodemailer.createTransport("SMTP", global.defaults[token]);
		/*
		smtp.sendMail(mail, function(error, response){
			if(error){
				console.log(error);
			}else{
				var resp = {
					"status": "okay",
					"message": "message send successful"
				}
				console.log( resp );
			}
			smtp.close(); // shut down the connection pool, no more messages
		});
		*/
		return mail.html;
	}else{
		// hmmm, no token? than go back to begin
		response.redirect('/');
	}
});
// launch our server on the ENV Port or 3000...
var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});