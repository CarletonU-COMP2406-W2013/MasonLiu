/**********************************************
	utility functions	
***********************************************/

 // returns true if an array contains the specified element
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}


/**********************************************
	module dependencies                       
***********************************************/

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , bcrypt = require("bcrypt-nodejs")
  , sessionStore = require('connect-mongo')(express)
  , mongoose = require('mongoose')
  , async = require('async'); 

// category names (used for comparison when handling a request to track a category)
var categories = [
	'funny',
	'sports',
	'nature',
	'people',
	'art',
	'misc'
];

/**********************************************
	database set up                       
***********************************************/

// mongoose model classes
var Pic;
var User;

// connect to the database (db must be started manually)
mongoose.connect('mongodb://localhost/users');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// once the DB connection is open...
db.once('open', function callback() {

	// create mongoose schemas and instantiate them into models
	
	// a picture (stored in /public/uploads)
	var PicSchema = mongoose.Schema({
		filename: String,
		path: String,
		srcUser: String,
		categories: [String],
		caption: String
	});
	Pic = mongoose.model("Pic", PicSchema);
	
	// a user
	var UserSchema = mongoose.Schema({
		username: String,
		password: String,
		favCategories: [String],
		favUsers: [String]
	});
	User = mongoose.model("User", UserSchema);
});

/**********************************************
	configure the application	
***********************************************/

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({
		uploadDir: './public/uploads/',
		keepExtensions: true
	}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ 
		cookie: {maxAge: 60000 * 60},
		secret: 'quo vadis',
		store: new sessionStore({
			db: "sessions"
		})
	}));
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/**********************************************
	route/handle GET requests	
***********************************************/

// index page, or if logged in, home page
app.get('/', function(req, res){
	if(req.session.username){
        res.redirect("/home");
	} else { 
		routes.index(req, res);
	}
});

// registration form
app.get('/register', routes.register);

// redirect to this page if error
app.get('/error', routes.error);

// user's home page; shows most recent uploads for tracked categories/users
app.get('/home', function(req, res){
	var lastUpload;
	var trackedCats = [];
	var trackedUsers = [];
	var recentPics = {};
	var userPics = {};
	
	// helper function to retrieve recent picture from category
	var getPicsInCategory = function(cat, callback) {
		Pic.find({categories: { $in: [cat.name] } }, function(err, pics){
			if(err)	callback(err);
			else {
				cat.pics = pics;
				callback();
			}
		});
	};
	
	// helper function to retrieve recent picture from user
	var getPicsFromUser = function(user, callback) {
		Pic.find({ srcUser: user.name }, function(err, pics){
			if(err)	callback(err);
			else {
				user.pics = pics;
				callback();
			}
		});
	};
	
	// if user is logged in, get their content
	if(req.session.username){
		async.parallel({
			// these methods execute in parallel
			uploads: function(callback){
				Pic.find({srcUser: req.session.username}, function(err, result){					
					callback(err || null, result);
				});
			},
			categories: function(callback){
				User.find({username: req.session.username}, function(err, users){
					if(err)	callback(err);
					else {
						
						var user = users[0];
						for (var i = 0; i < user.favCategories.length; i++)	{
							trackedCats[i] = {
								name: user.favCategories[i],
								pics: []
							}
						}		
					
						async.each(trackedCats, getPicsInCategory, function(err){
							if(err)	callback(err);
							else {
								for (var i = 0; i < trackedCats.length; i++) {
									recentPics[trackedCats[i].name] = trackedCats[i].pics[trackedCats[i].pics.length-1];							
								}
								callback();
							}
						});
					}
				});	
			},
			users: function(callback) {
				User.find({username: req.session.username}, function(err, users){
					if(err) callback(err);
					else {
						var user = users[0];
						for (var i = 0; i < user.favUsers.length; i++)
						{
							trackedUsers[i] = {
								name: user.favUsers[i],
								pics: []
							}
						}				
						async.each(trackedUsers, getPicsFromUser, function(err){
							if(err) callback(err);
							else {
								for (var i = 0; i < trackedUsers.length; i++) {
									userPics[trackedUsers[i].name] = trackedUsers[i].pics[trackedUsers[i].pics.length-1];							
								}
								callback();
							}
						});
					}
				});	
			}
		},
		function(err, results){
			if(err) {
				console.error(err);
				res.redirect("/error");
				return;
			}
			// pics are in results object
			lastUpload = results.uploads[results.uploads.length-1];
			routes.home(req, res, lastUpload, recentPics, userPics);
		});		
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
			if(err) {
				console.error(err);
				res.redirect("/error");
				return;
			}
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
			if(err) {
				console.error(err);
				res.redirect("/error");
				return;
			}
			res.redirect("/");
		});	
	} else {
		res.redirect("/");
	}
});

// category index page; don't check for log in, categories are publicly available
app.get('/catIndex', function(req, res){
	var recentPics = {
		funny: [],
		sports: [],
		nature: [],
		people: [],
		art: [],
		misc: []
	};
	
	// find recent pictures from each category 	
	async.parallel({
		f: function(callback){
			Pic.find({categories: { $in: ["funny"] } }, function(err, result){
				callback(err || null, result);
			});
		},
		s: function(callback){
			Pic.find({categories: { $in: ["sports"] } }, function(err, result){
				callback(err || null, result);
			});
		},
		n: function(callback){
			Pic.find({categories: { $in: ["nature"] } }, function(err, result){
				callback(err || null, result);
			});
		},
		p: function(callback){
			Pic.find({categories: { $in: ["people"] } }, function(err, result){
				callback(err || null, result);
			});
		},
		a: function(callback){
			Pic.find({categories: { $in: ["art"] } }, function(err, result){
				callback(err || null, result);
			});
		},
		m: function(callback){
			Pic.find({categories: { $in: ["misc"] } }, function(err, result){
				callback(err || null, result);
			});
		}
	},
	function(err, results){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		
		if (results.f[results.f.length-1] !== undefined) recentPics.funny.push(results.f[results.f.length-1]);
		if (results.f[results.f.length-2] !== undefined) recentPics.funny.push(results.f[results.f.length-2]);
		if (results.f[results.f.length-3] !== undefined) recentPics.funny.push(results.f[results.f.length-3]);
		
		if (results.s[results.s.length-1] !== undefined) recentPics.sports.push(results.s[results.s.length-1]);
		if (results.s[results.s.length-2] !== undefined) recentPics.sports.push(results.s[results.s.length-2]);
		if (results.s[results.s.length-3] !== undefined) recentPics.sports.push(results.s[results.s.length-3]);
		
		if (results.n[results.n.length-1] !== undefined) recentPics.nature.push(results.n[results.n.length-1]);
		if (results.n[results.n.length-2] !== undefined) recentPics.nature.push(results.n[results.n.length-2]);
		if (results.n[results.n.length-3] !== undefined) recentPics.nature.push(results.n[results.n.length-3]);
		
		if (results.p[results.p.length-1] !== undefined) recentPics.people.push(results.p[results.p.length-1]);
		if (results.p[results.p.length-2] !== undefined) recentPics.people.push(results.p[results.p.length-2]);
		if (results.p[results.p.length-3] !== undefined) recentPics.people.push(results.p[results.p.length-3]);
		
		if (results.a[results.a.length-1] !== undefined) recentPics.art.push(results.a[results.a.length-1]);
		if (results.a[results.a.length-2] !== undefined) recentPics.art.push(results.a[results.a.length-2]);
		if (results.a[results.a.length-3] !== undefined) recentPics.art.push(results.a[results.a.length-3]);
		
		if (results.m[results.m.length-1] !== undefined) recentPics.misc.push(results.m[results.m.length-1]);
		if (results.m[results.m.length-2] !== undefined) recentPics.misc.push(results.m[results.m.length-2]);
		if (results.m[results.m.length-3] !== undefined) recentPics.misc.push(results.m[results.m.length-3]);		
		
		routes.catIndex(req, res, recentPics);
	});		
});

// cateogry routing

app.get('/catFunny', function(req, res){
	Pic.find({categories: { $in: ["funny"] } }, function(err, pics){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		routes.catViewer(req, res, "Funny", pics);
	});
});

app.get('/catSports', function(req, res){
	Pic.find({categories: { $in: ["sports"] } }, function(err, pics){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		routes.catViewer(req, res, "Sports", pics);
	});
});

app.get('/catNature', function(req, res){
	Pic.find({categories: { $in: ["nature"] } }, function(err, pics){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		routes.catViewer(req, res, "Nature", pics);
	});
});

app.get('/catPeople', function(req, res){
	Pic.find({categories: { $in: ["people"] } }, function(err, pics){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		routes.catViewer(req, res, "People", pics);
	});
});

app.get('/catArt', function(req, res){
	Pic.find({categories: { $in: ["art"] } }, function(err, pics){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		routes.catViewer(req, res, "Art", pics);
	});
});

app.get('/catMisc', function(req, res){
	Pic.find({categories: { $in: ["misc"] } }, function(err, pics){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		routes.catViewer(req, res, "Miscellaneous", pics);
	});
});

/**********************************************
	route/handle POST requests	
***********************************************/

// login form submission
app.post('/login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	
	// look for the requested username
	User.find({username: username}, function(err, users){
		if(err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		else if (users.length==0) {
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
app.post('/uploadFile', function(req, res) {
	
	// check if a file was selected and then removed via file upload form
	// note that uploaded file is defined by default, so this check only works for above situation
	if (req.files.uploadedFile === undefined)
	{
		res.redirect("/upload?error=No file selected.");
		return;
	}
	
	var newPic;
	var type = req.files.uploadedFile.type;
	var newCaption = req.body.caption;	
	if (newCaption === "")
		newCaption = "< No caption >";

	// build tracked category array from checkbox results
	var choices = [];
	if (req.body.catBoxFunny) choices.push("funny");
	if (req.body.catBoxSports) choices.push("sports");
	if (req.body.catBoxNature) choices.push("nature");
	if (req.body.catBoxPeople) choices.push("people");
	if (req.body.catBoxArt) choices.push("art");
	if (req.body.catBoxMisc) choices.push("misc");	
	
	// get initial path of file
	var tmp_path = req.files.uploadedFile.path;
	// set the target path using the actual name of the file
	var target_path = './public/uploads/' +  req.files.uploadedFile.name;
	
	// attempt to rename the file; simultaneously check that the file is valid
	fs.rename(tmp_path, target_path, function(err) {
		if (err) // error thrown if no file was selected at all
		{
			console.error(err);
			res.redirect("/upload?error=No file selected.");
			return;
		}
		
		// make sure the file is an image
		if (type.slice(0,5) !== "image") {
			// note that the file is already uploaded, we simply do not create a db document for it...would be better to prevent upload in the first place
			res.redirect("/upload?error=The file you submitted is not an image.");
			return;
		}
		
		// file is an image, so create new picture document
		newPic = new Pic({
			filename: req.files.uploadedFile.name,
			path: './uploads/' + req.files.uploadedFile.name,
			srcUser: req.session.username,
			categories: choices,
			caption: newCaption
		});
		
		newPic.save(function(err, newPic) {
			console.log("new pic saved: " + newPic);
			// delete the temporary file (with garbage filename)
			fs.unlink(tmp_path, function() {
				if (err) console.error(err);
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
	// this could also be checked client-side, but meh
	if (req.body.password !== req.body.passconf) {		
		req.body.password = "";
		req.body.passconf = "";
		res.redirect('/register?error=The passwords you entered do not match.');
		return;
	}
	
	User.find({username: username}, function(err, users) {
		if (err) {
			console.error(err);
			res.redirect("/register?error=An error occured.");
			return;
		}
		// check if the user already exists
		if(users.length!=0){
			res.redirect("/register?error=This Username has been taken.");
			return;
		}
		
		// hash the password and store the hash in a new User document
		bcrypt.genSalt(10, function(err, salt) {
			if (err) {
				console.error(err);
				res.redirect("/register?error=An error occured.");
				return;
			}
			bcrypt.hash(password, salt, null, function(err, hash) {
				if (err) {
					console.error(err);
					res.redirect("/register?error=An error occured.");
					return;
				}
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

// search for a user and track them
app.post('/trackUser', function(req, res) {

	// prevent self-tracking
	if (req.body.user === req.session.username) {
		res.redirect("/home?error=You cannot track yourself!");
		return;
	}
	
	
	User.find({username: req.body.user}, function(err,users) {
		if (err) {
			console.error(err);
			res.redirect("/error");
			return;
		}
		if (users.length !== 0)	{
			// user exists; add it this users' tracked users
			User.find({username: req.session.username}, function(err,thisUser) {
				if (err) {
					console.error(err);
					res.redirect("/error");
					return;
				}
				var user = thisUser[0];
				if (user.favUsers.contains(users[0].username)) {
					res.redirect("/home?error=You are already tracking user \"" + req.body.user + "\"");
					return;
				}
				
				user.favUsers.push(users[0].username);
				
				var conditions = { username: req.session.username };
				var update = { $set: { favUsers: user.favUsers }};
				User.update(conditions, update, null, function(err){
					if (err) {
						console.error(err);
						res.redirect("/error");
						return;
					}
					res.redirect("/home?msg=Now tracking user \"" + req.body.user + "\"");
				});
			});
		} else	{
			// user does not exist
			res.redirect("/home?error=No user by the name \"" + req.body.user + "\" exists.");
		}
	});
});

// search for a category and track it if it is valid
app.post('/trackCat', function(req, res) {

	var user;
	
	// confirm the input is a valid category
	if (categories.contains(req.body.cat)) {
	
		// retrieve user info
		User.find({username: req.session.username}, function(err,results) {
			if (err) {
				console.error(err);
				res.redirect("/error");
				return;
			}
							
			user = results[0];
			if (!user) {
				res.redirect("/error");		
				return;
			}
			
			console.log(user.favCategories);
			if (user.favCategories.contains(req.body.cat))
				res.redirect("/home?error=You are already tracking category \"" + req.body.cat + "\"");
			else
			{
				// update this user's schema
				var conditions = { username: req.session.username };
				var update = { $set: { favCategories: user.favCategories }};
				
				user.favCategories.push(req.body.cat);
				User.update(conditions, update, null, function(err) {
					if (err) {
						console.error(err);
						res.redirect("/error");
						return;
					}
					res.redirect("/home?msg=You are now tracking category \"" + req.body.cat + ".\"");
				});				
			}
		});
	} else {
		res.redirect("/home?error=No category by the name \"" + req.body.cat + "\" exists.");
	}	
});

// run app 
http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});