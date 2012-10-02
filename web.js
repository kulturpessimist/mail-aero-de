// _require_ all the libraries!
var express = require('express'),
	mailer	= require('nodemailer'),
	_		= require('underscore'),
	fs		= require('fs'),
	path	= require('path'),
	sprintf = require('sprintf').sprintf,
	crypto	= require('crypto'),
	config	= {},
	// a server with express... ah such a nice library!
	app = express.createServer(express.logger());

var jsonp = function(obj,callback){
	if(callback=="" || callback==undefined){
		callback="mail_response";
	}
	return callback+"("+JSON.stringify(obj)+")";
}
// _configure_ all the parameters!
app.configure(function(){
	//	lets parse the config.json for name, version and dependencies	
	var _u	= JSON.parse( fs.readFileSync( path.resolve(__dirname + '/config.json') ,'utf-8') );
	_.extend(config, _u);
	app.use(express.methodOverride());
	// static files for our "frontend"
	app.use(express.static(__dirname + '/public'));
	// dynamic views
	app.set('view engine', 'ejs');
	app.set('view options', { layout: false });
	app.set('views', __dirname + '/views');
	// and last but not least the body Parser for our post route
	app.use(express.bodyParser());
});
// now exactly the same for post requests 
// with optional parameters for the padding
app.post('/api/:token/?', function(request, response) {
	var token = request.params.token || '';
	console.log('params for transaction', request.body);
	// email parameters
	var mail = {
		"from": request.body.from || "æro mail service<mail@æro.de>",
		"to": request.body.to,
		"cc": request.body.cc || "",
		"bcc": request.body.bcc || "",
		"subject": request.body.subject,
		"html": "",
		"generateTextFromHTML": request.body.generateTextFromHTML || true
		//,"headers": {},
		//"attachments": []
	}
	// do we have a token?
	if(config.users.hasOwnProperty(token)){
		request.body.header = config.users[token].img;
		response.render('simple-basic',{ mail:request.body || "" }, function(err, html){
			mail.html = html;
		});
		
		var smtp = mailer.createTransport("SMTP", config.users[token].smtp);
		smtp.sendMail(mail, function(error, res){
			if(error){
				response.send( jsonp(error,request.body.callback) );
			}else{
				var resp = {
					"status": "okay",
					"message": "message send successful"
				}
				response.send( jsonp(resp,request.body.callback) );
			}
			smtp.close(); // shut down the connection pool, no more messages
		});
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