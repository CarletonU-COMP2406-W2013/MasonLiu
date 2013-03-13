
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , bcrypt = require("bcrypt-nodejs")
  , sessionStore = require('connect-mongo')(express)
  , mongoose = require('mongoose');
  //, db = require('./db').PicHubDataBase;
  
var User;

//connect to the "users" database
mongoose.connect('mongodb://localhost/users');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

//once the DB connection is open...
db.once('open', function callback () {
	//Create a mongoose Schema (document structure)
  var userSchema = mongoose.Schema({
		username: String,
		password: String
	});
	
	//Convert this schema into an instantiable "model" Class 
	User = mongoose.model("User", userSchema);
});



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
  app.use(express.session({ 
			cookie: {maxAge: 60000 * 60}, // one hour
			secret: 'quo vadis',
			store: new sessionStore({
						db: "sessions"
					})
			})
  );
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* route GET requests */

app.get('/', function(req, res){
	if(req.session.username){
        res.redirect("/home");
	} else { 
		routes.index(req, res);
	}
});
app.get('/home', function(req, res){
	if(req.session.username){
		console.log("this sessions user: " + req.session.username);
		routes.home(req, res);
	} else {
		res.redirect("/");
	}
});
app.get('/users', user.list);
app.get('/uploadSuccess', routes.uploadSuccess);

/* route POST requests */
app.post('/', routes.index);
//app.post('/login', routes.login);
app.post('/login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	//Search the Database for a User with the given username
	User.find({username: username}, function(err, users){
		//we couldn't find a user with that name
		if(err || users.length==0){
			res.redirect("/?error=invalid username or password");	
			return;
		}
		
		var user = users[0];
		//compare the hash we have for the user with what this password hashes to
		bcrypt.compare(password, user.password, function(err, authenticated){
			if(authenticated){
				req.session.username = user.username;
				res.redirect("/home");
			}else{
				res.redirect("/?error=invalid username or password");	
			}
		});
	});
});
//app.post('/logout', routes.logout);
app.post("/logout", function(req, res){
	req.session.destroy(function(err){
      if(err){
          console.log("Error: %s", err);
      }
      res.redirect("/");
  });	
});
app.post('/viewer', routes.viewer);
app.post('/home', routes.home);
app.post('/myAccount', routes.myacct);
app.post('/register', routes.register);
app.post('/upload', routes.upload);
app.post('/uploadSuccess', routes.uploadSuccess);
app.post('/uploadFile', routes.uploadFile);
app.post('/registerSubmit', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	User.find({username: username}, function(err, users){
	  //check if the user already exists
	  console.log(users);
	  if(users.length!=0){
		  console.log("redirecting with error...");
		  res.redirect("/?error=user already exists");	
		  return;
	  }
	  //generate a salt, with 10 rounds (2^10 iterations)
	  bcrypt.genSalt(10, function(err, salt) {
		  //hash the given password using the salt we generated
      bcrypt.hash(password, salt, null, function(err, hash) {
      	//create a new instance of the mongoose User model we defined above
      	var newUser = new User({
      		username: username,
      		password: hash
      	});	
      	
      	//save() is a magic function from mongoose that saves this user to our DB
      	newUser.save(function(err, newUser){
      		res.send("successfully registered user: "+newUser.username);
      	});    
      });
	  });	
	});	
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));  
});














