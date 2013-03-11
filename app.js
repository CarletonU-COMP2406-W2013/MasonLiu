
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
  
var db = require('./db').PicDB;
  
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir: './temp/'}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'quo vadis'}));
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* start db */
var db = new PicDB('localhost', 27017);

/* route GET requests */
app.get('/', routes.index);
app.get('/home', routes.home);
app.get('/users', user.list);
app.get('/uploadSuccess', routes.uploadSuccess);

/* route POST requests */
app.post('/', routes.index);
app.post('/login', routes.login);
app.post('/logout', routes.logout);
app.post('/viewer', routes.viewer);
app.post('/home', routes.home);
app.post('/myAccount', routes.myacct);
app.post('/register', routes.register);
app.post('/upload', routes.upload);
app.post('/uploadSuccess', routes.uploadSuccess);
app.post('/uploadFile', routes.uploadFile);

/*
	function(req, res, next){
	console.log("POST received to /uploadFile");
	console.log(req.body);
	console.log(req.files);
}); //routes.uploadFile
*/



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});