
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , bcrypt = require("bcrypt-nodejs")
  , sessionStore = require('connect-mongo')(express)
  , mongoose = require('mongoose');  
  //, db = require('./db').PicHubDataBase;

// mongoose model classes  
var Comment;
var Pic;
var User;

// connect to the database (db must be started manually)
mongoose.connect('mongodb://localhost/users');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

//once the DB connection is open...
db.once('open', function callback () {

	// create mongoose schemas and instantiate them into models
	
	// a comment
	var CommentSchema = mongoose.Schema({
		user: String,
		text: String
	});
	Comment = mongoose.model("Comment", CommentSchema);
	
	// a picture (stored in /public/uploads)
	var PicSchema = mongoose.Schema({
		filename: String,
		path: String,
		srcUser: String,
		categories: [String],
		caption: String,
		comments: [CommentSchema]
	});
	Pic = mongoose.model("Pic", PicSchema);
	
	// a user
	var UserSchema = mongoose.Schema({
		username: String,
		password: String,
		uploads: [PicSchema],
		favCategories: [String],
		friends: [String]
	});
	User = mongoose.model("User", UserSchema);
});

/* configure the application */
var app = express();
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir: './public/uploads/'}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ 
			cookie: {maxAge: 60000 * 60},
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

/**
	route/handle GET requests	
*/

app.get('/', function(req, res){
	if(req.session.username){
        res.redirect("/home");
	} else { 
		routes.index(req, res);
	}
});

app.get('/users', user.list); // not currently used

app.get('/register', routes.register);

/* navbar routes - need to check if user is logged in before routing */

// user's home page; shows most recent uploads for tracked categories/users
app.get('/home', function(req, res){
	var imgPath;
	var pic;
	
	if(req.session.username){		
		Pic.find({srcUser: req.session.username}, function(err, pics){
			if (pics.length != 0)
			{
				pic = pics[pics.length-1];
				imgPath = pic.path;
				routes.home(req, res, imgPath);
			}
			else routes.home(req, res); // TODO: make home page display something else if no image
		});/*
		User.find({username: req.session.username}, function(err, users){
			var user = users[0];
			Pic.find({categories: { $in: user.favCategories } }, function(err, favs){
				if (favs.length != 0)
				{
					console.log("favs = " + favs);
					var pic = favs[0];
					imgPath = pic.path;
					routes.home(req, res, imgPath);
				}
				else routes.home(req, res); // TODO: make home page display something else if no image
			});
		});	*/	
	} else {
		res.redirect("/");
	}
});

// file upload form
app.get('/upload', function(req, res) {
	if(req.session.username) routes.upload(req, res);
	else res.redirect("/");
});

// gallery of user's own uploads
app.get('/myUploads', function(req, res){
	if(req.session.username){
		Pic.find({srcUser: req.session.username}, function(err, pics){
			routes.catViewer(req, res, "My Uploads", pics);
		});
	} else {
		res.redirect("/");
	}
});

// log this user out
app.get('/logout', function(req, res) {
	if(req.session.username){
		req.session.destroy(function(err) {
			if(err){
				console.log("Error: %s", err);
			}
			res.redirect("/");
		});	
	} else {
		res.redirect("/");
	}
});

// category index page; don't check for log in, categories are publicly available
app.get('/catIndex', function(req, res){	
	var imgArray = [];
	var recentPics = {
		funny: [],
		sports: [],
		nature: [],
		people: [],
		art: [],
		misc: []
	};
	
	Pic.find({categories: { $in: ["funny"] } }, function(err, picsFunny){
		Pic.find({categories: { $in: ["sports"] } }, function(err, picsSports){
			Pic.find({categories: { $in: ["nature"] } }, function(err, picsNature){
				Pic.find({categories: { $in: ["people"] } }, function(err, picsPeople){
					Pic.find({categories: { $in: ["art"] } }, function(err, picsArt){
						Pic.find({categories: { $in: ["misc"] } }, function(err, picsMisc){
						
							if (picsFunny[picsFunny.length-1] !== undefined) recentPics.funny.push(picsFunny[picsFunny.length-1]);
							if (picsFunny[picsFunny.length-2] !== undefined) recentPics.funny.push(picsFunny[picsFunny.length-2]);
							if (picsFunny[picsFunny.length-3] !== undefined) recentPics.funny.push(picsFunny[picsFunny.length-3]);
							
							if (picsSports[picsSports.length-1] !== undefined) recentPics.sports.push(picsSports[picsSports.length-1]);
							if (picsSports[picsSports.length-2] !== undefined) recentPics.sports.push(picsSports[picsSports.length-2]);
							if (picsSports[picsSports.length-3] !== undefined) recentPics.sports.push(picsSports[picsSports.length-3]);
							
							if (picsNature[picsNature.length-1] !== undefined) recentPics.nature.push(picsNature[picsNature.length-1]);
							if (picsNature[picsNature.length-2] !== undefined) recentPics.nature.push(picsNature[picsNature.length-2]);
							if (picsNature[picsNature.length-3] !== undefined) recentPics.nature.push(picsNature[picsNature.length-3]);
							
							if (picsPeople[picsPeople.length-1] !== undefined) recentPics.people.push(picsPeople[picsPeople.length-1]);
							if (picsPeople[picsPeople.length-2] !== undefined) recentPics.people.push(picsPeople[picsPeople.length-2]);
							if (picsPeople[picsPeople.length-3] !== undefined) recentPics.people.push(picsPeople[picsPeople.length-3]);
							
							if (picsArt[picsArt.length-1] !== undefined) recentPics.art.push(picsArt[picsArt.length-1]);
							if (picsArt[picsArt.length-2] !== undefined) recentPics.art.push(picsArt[picsArt.length-2]);
							if (picsArt[picsArt.length-3] !== undefined) recentPics.art.push(picsArt[picsArt.length-3]);
							
							if (picsMisc[picsMisc.length-1] !== undefined) recentPics.misc.push(picsMisc[picsMisc.length-1]);
							if (picsMisc[picsMisc.length-2] !== undefined) recentPics.misc.push(picsMisc[picsMisc.length-2]);
							if (picsMisc[picsMisc.length-3] !== undefined) recentPics.misc.push(picsMisc[picsMisc.length-3]);
						
							routes.catIndex(req, res, recentPics);
						});
					});
				});
			});
		});
	});
});

// cateogry routing
app.get('/catFunny', function(req, res){
	Pic.find({categories: { $in: ["funny"] } }, function(err, pics){
			routes.catViewer(req, res, "Funny", pics);
	});
});
app.get('/catSports', function(req, res){
	Pic.find({categories: { $in: ["sports"] } }, function(err, pics){
		routes.catViewer(req, res, "Sports", pics);
	});
});
app.get('/catNature', function(req, res){
	Pic.find({categories: { $in: ["nature"] } }, function(err, pics){
		routes.catViewer(req, res, "Nature", pics);
	});
});
app.get('/catPeople', function(req, res){
	Pic.find({categories: { $in: ["people"] } }, function(err, pics){
		routes.catViewer(req, res, "People", pics);
	});
});
app.get('/catArt', function(req, res){
	Pic.find({categories: { $in: ["art"] } }, function(err, pics){
		routes.catViewer(req, res, "Art", pics);
	});
});
app.get('/catMisc', function(req, res){
	Pic.find({categories: { $in: ["misc"] } }, function(err, pics){
		routes.catViewer(req, res, "Miscellaneous", pics);
	});
});

/**
	route/handle POST requests
*/

// login form submitted
app.post('/login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	
	// look for the requested username
	User.find({username: username}, function(err, users){
		if(err || users.length==0){
			res.redirect("/?error=Invalid Username");	
			return;
		}
		
		var user = users[0];
		// compare entered password to stored password
		bcrypt.compare(password, user.password, function(err, authenticated) {
			if(authenticated) {
				req.session.username = user.username;
				res.redirect("/home");
			}else{
				res.redirect("/?error=Incorrect Password for this Username.");	
			}
		});
	});
});

// file upload form submission
/* TODO: handle null submission for upload */
app.post('/uploadFile', function(req, res) {
	
	console.log("req.files.uploadedFile = " + req.files.uploadedFile);
	console.log("req.body = " + req.body);
	
	// check if a file was actually uploaded ** does not work **
	if (req.files.uploadedFile === undefined || req.files.uploadedFile.path === undefined)
	{
		res.redirect("/upload?error=No file selected.");
		return;
	}	
	
	var newCaption = req.body.caption;

	var choices = [];
	if (req.body.catBoxFunny) choices.push("funny");
	if (req.body.catBoxSports) choices.push("sports");
	if (req.body.catBoxNature) choices.push("nature");
	if (req.body.catBoxPeople) choices.push("people");
	if (req.body.catBoxArt) choices.push("art");
	if (req.body.catBoxMisc) choices.push("misc");
	
	var newPic;
	var newAlbum;	
	
	// get temporary location of file
	var tmp_path = req.files.uploadedFile.path;
	this.latestUpload = tmp_path;
	// set where file should actually exist
	var target_path = './public/uploads/' +  req.files.uploadedFile.name;
	// move the file from the temporary location to the intended location
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		
		// create new picture document
		newPic = new Pic({
			filename: req.files.uploadedFile.name,
			path: './uploads/' + req.files.uploadedFile.name,
			srcUser: req.session.username,
			categories: choices,
			caption: newCaption
		});
		
		// add the new picture to our user's 'uploads' album		
		User.find({username: req.session.username}, function(err, users) {
			var user = users[0];
			console.log("\nuser object from upload file: " + user);
			user.uploads.push(newPic);
			console.log("user object from upload file: " + user);
		});
		
		newPic.save(function(err, newPic) {
			console.log("new pic saved: " + newPic);
			// delete the temporary file
			fs.unlink(tmp_path, function() {
				if (err) throw err;
				routes.uploadSuccess(req, res, newPic.path, newCaption);
			});
		}); 
		
	});
	
});

// account registration form submitted
app.post('/registerSubmit', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var passconf = req.body.passconf;
	
	// store catgegories selected from checkboxes
	var choices = [];
	if (req.body.catBoxFunny) choices.push("funny");
	if (req.body.catBoxSports) choices.push("sports");
	if (req.body.catBoxNature) choices.push("nature");
	if (req.body.catBoxPeople) choices.push("people");
	if (req.body.catBoxArt) choices.push("art");
	if (req.body.catBoxMisc) choices.push("misc");
	
	// check if password confirmation does not match
	if (req.body.password !== req.body.passconf) {		
		req.body.password = "";
		req.body.passconf = "";
		res.redirect('/register?error=The passwords you entered do not match.');
		return;
	}
	
	User.find({username: username}, function(err, users) {
		// check if the user already exists
		console.log(users);
		if(users.length!=0){
			res.redirect("/register?error=This Username has been taken.");
			return;
		}
		
		// hash the password and store the hash in a new User document
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(password, salt, null, function(err, hash) {
				var newUser = new User({
					username: username,
					password: hash,
					uploads: [],
					favCategories: choices
				});	

				// save new user's info to DB
				newUser.save(function(err, newUser) {
					routes.registerSuccess(req, res, newUser.username);
				});    
			});
		});	
	});
});

// comment listing for a picture requested (via corner button)
app.post('/comment/:id', function(req, res) {
	console.log("pic id: " + req.params.id);
	Pic.find({_id: req.params.id}, function(err, pics){
		console.log("pic found for id " + pics[0]._id);
		routes.comments(req, res, pics[0]);
	});
	//res.redirect("/catIndex");
});



/* run app */
http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});