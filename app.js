
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
  , mongoose = require('mongoose')
  , fs = require('fs');
  //, db = require('./db').PicHubDataBase;
  
var User;

//connect to the "users" database
mongoose.connect('mongodb://localhost/users');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

//once the DB connection is open...
db.once('open', function callback () {
	//Create mongoose Schemas (document structure)
	
	var PicSchema = mongoose.Schema({
		filename: String,
		path: String,
		srcUser: String,
		categories: [String]
	});
	var AlbumSchema = mongoose.Schema({
		title: String,
		pictures: [PicSchema],
		
	});
	var userSchema = mongoose.Schema({
		username: String,
		password: String,
		uploads: [PicSchema]
	});
	
	// Convert these schemas into instantiable "model" Classes
	Pic = mongoose.model("Pic", PicSchema);
	Album = mongoose.model("Album", AlbumSchema);
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

/*** route/handle GET requests ***/
/* make sure to check if user is logged in before routing */

app.get('/', function(req, res){
	if(req.session.username){
        res.redirect("/home");
	} else { 
		routes.index(req, res);
	}
});

app.get('/home', function(req, res){
	if(req.session.username){
		var imgPath;
		Pic.find({srcUser: req.session.username}, function(err, pics){
			if (pics.length != 0) // 
			{
				var pic = pics[pics.length-1];
				imgPath = pic.path;
				console.log("imgPath (from app.js inner): " + imgPath);
				routes.home(req, res, imgPath);
			}
			else routes.home(req, res); // TODO: make home page display something else if no image
		});
		console.log("imgPath (from app.js outer): " + imgPath);
		//routes.home(req, res, imgPath);
	} else {
		res.redirect("/");
	}
});

app.get('/users', user.list); // not currently used
app.get('/register', routes.register);

/*** route/handle POST requests ***/

app.post('/', routes.index);
app.post('/viewer', routes.viewer);
app.post('/viewer2', function(req, res){
	Pic.find({srcUser: req.session.username}, function(err, pics){
		routes.viewer2(req, res, pics);
	});
});
app.post('/home', routes.home);
// app.post('/myAccount', routes.myacct);  *** NO LONGER IN USE ***
app.post('/register', routes.register);
app.post('/myUploads', function(req, res){
	Pic.find({srcUser: req.session.username}, function(err, pics){
		routes.myUploads(req, res, pics);
	});
});
app.post('/upload', routes.upload);
app.post('/uploadSuccess', routes.uploadSuccess);
app.post('/login', function(req, res){
	//Pic.remove({}, function(){});
	Pic.find({srcUser: req.session.username}, function(err, pics){
			console.log("Pictures for this user: " + pics);
	});
	var username = req.body.username;
	var password = req.body.password;
	//Search the Database for a User with the given username
	User.find({username: username}, function(err, users){
		//we couldn't find a user with that name
		if(err || users.length==0){
			res.redirect("/?error=Invalid Username");	
			return;
		}
		
		var user = users[0];
		//compare the hash we have for the user with what this password hashes to
		bcrypt.compare(password, user.password, function(err, authenticated){
			if(authenticated){
				req.session.username = user.username;
				res.redirect("/home");
			}else{
				res.redirect("/?error=Incorrect Password for this Username.");	
			}
		});
	});
});

app.post('/logout', function(req, res){
	req.session.destroy(function(err){
      if(err){
          console.log("Error: %s", err);
      }
      res.redirect("/");
  });	
});

app.post('/uploadFile', function(req, res){
	console.log(req.files);
	console.log(req.session);
	var newPic
	  , newAlbum;
	
	//latestUpload = req.files.uploadedFile.name;
	// get temporary location of file
	var tmp_path = req.files.uploadedFile.path;
	this.latestUpload = tmp_path;
	// set where file should actually exist (in this case, images directory)
	var target_path = './public/uploads/' +  req.files.uploadedFile.name;
	// move the file from the temporary location to the intended location
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		
		// create new picture document
		newPic = new Pic({
			filename: req.files.uploadedFile.name,
			path: './uploads/' + req.files.uploadedFile.name,
			srcUser: req.session.username
		});
		
		// add the new picture to our user's 'uploads' album		
		User.find({username: req.session.username}, function(err, users){
			var user = users[0];
			console.log("\nuser object from upload file: " + user);
			user.uploads.push(newPic);
			console.log("user object from upload file: " + user);
		});
		
		newPic.save(function(err, newPic){
			console.log("new pic saved: " + newPic);
			// delete the temporary file, so that the explicitly set
			// temporary upload dir does not get filled with unwanted files
			fs.unlink(tmp_path, function() {
				if (err) throw err;
				routes.uploadSuccess(req, res, newPic.path);
			});
		}); 
		
	});
	
});

app.post('/registerSubmit', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var passconf = req.body.passconf;
	
	if (req.body.password !== req.body.passconf) {
		req.body.password = "";
		req.body.passconf = "";
		res.redirect('/register?error=The passwords you entered do not match.');
		return;
	}
	
	User.find({username: username}, function(err, users){
	  //check if the user already exists
	  console.log(users);
	  if(users.length!=0){
		  res.redirect("/register?error=This Username has been taken.");
		  return;
	  }
	  //generate a salt, with 10 rounds (2^10 iterations)
	  bcrypt.genSalt(10, function(err, salt) {
		  //hash the given password using the salt we generated
	  bcrypt.hash(password, salt, null, function(err, hash) {
		//create a new instance of the mongoose User model we defined above
		var newUser = new User({
			username: username,
			password: hash,
			uploads: []
		});	
		
		//save() is a magic function from mongoose that saves this user to our DB
		newUser.save(function(err, newUser){
			routes.registerSuccess(req, res, newUser.username);
		});    
	  });
	  });	
	});
});

/* run app */

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});