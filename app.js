var express = require('express');
var multer= require('multer');
var autoreap= require('multer-autoreap');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db;
var cloudant;
var fs=require('fs');
// Remark if app.js needs to be run local, the password for cloudant in hsternkicker account needs to be provided from environment. Either call export cloudant_password=******** on shell before running node app.js or use another way.
var localpasswd= process.env.cloudant_password
var localaccount=process.env.cloudant_account
var dbCredentials ={
	dbName : 'recipes_db'
};

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(autoreap);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({dest: 'images/'}));



// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.


function initDBConnection() {
	
	if(process.env.VCAP_SERVICES) {
		if(services.cloudantNoSQLDB) {
			dbCredentials.host = services.cloudantNoSQLDB[0].credentials.host;
			dbCredentials.port = services.cloudantNoSQLDB[0].credentials.port;
			dbCredentials.user = services.cloudantNoSQLDB[0].credentials.username;
			dbCredentials.password = services.cloudantNoSQLDB[0].credentials.password;
			dbCredentials.url = services.cloudantNoSQLDB[0].credentials.url;
		}
		console.log('VCAP Services: '+JSON.stringify(process.env.VCAP_SERVICES));
		cloudant = require('cloudant')(dbCredentials.url);
	} else {
		// not on bluemix, use hsternkicker.cloudant.com for testing

		cloudant = require('cloudant')({account:localaccount, password:localpasswd});
	}

	
	
	//check if DB exists if not create
	cloudant.db.create(dbCredentials.dbName, function (err, res) {
		if (err) { console.log('could not create db ', err); }
    });
	db = cloudant.use(dbCredentials.dbName);
}

initDBConnection();


app.use('/', routes);
app.use('/users', users);

app.post('/eingabe', function(req,res) {
	console.log(req.body.name);
	console.log(req.files);	
	var recipetitle=req.body.name;
	var ingredients=req.body.ingredients;
	var recipe=req.body.rezept;
	var image=req.files.bildpfad.path;
	var data=fs.readFileSync(image);
	var uristring = new Buffer(data).toString('base64');
	var base64uri='data:image/jpeg;base64,';	
	base64uri+=uristring;

	var newreciperecord={'recipetitle':recipetitle, 'ingredients':ingredients, 'recipe':recipe, 'img':base64uri};
	db.insert(newreciperecord, function(err,body,header){
		if (!err) {
			console.log('name: ' + req.param('name') + req.param('ingredients') + req.param('rezept'));
			res.render('confirm', { title: 'Eingabebestätigung' });	
		} else {
			res.render('dberror', { title: 'Datenbankfehler' });
		}
	})
	
});
// der folgende Code ist auskommentiert weil er es nicht tut. mit app.post bekomm ich einen 404 Fehler mit app.get, bekomm ich die Seite angezeigt, aber kann sie nicht verarbeiten.
// app.post('/e', function(req,res) {
//	console.log(req.query.id);
//	db.get(req.query.id, function(err,body){
//	if (!err){
//		res.render('rezeptedit', {title : 'Rezeptedit', doc : body });	
//	}
//	});
//	console.log(req.body);
// });

app.get('/rezepte', function(req,res) {
	var recipelist={};
	var list="//";
	db.list({include_docs:true}, function(err,body){
	console.log(body);
	res.render('rezepte', { title : 'Rezeptliste', list : body });
	}); 
});
// a REST API !!
app.get('/getrecipelist', function(req,res) {
	var recipelist={};
	db.list({include_docs:true}, function(err,body){
	console.log(body);
	res.json(body);
	}); 
});

app.get ('/p', function(req,res) {
	console.log(req.query.id);
	db.get(req.query.id, function(err,body){
	if (!err){
		res.render('rezeptdetails', {title : 'Rezeptdetail', doc : body });	
	}
	});
	
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);;
module.exports = app;
