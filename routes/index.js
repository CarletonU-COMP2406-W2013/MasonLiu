var mongoose = require('mongoose')
  //, db = require('../db')
  //, session = require('../session')
  //, bcrypt = require("bcrypt-nodejs")
  , fs = require('fs');
  
var preTitle = "PictureHub - ";

/* front page */
exports.index = function(req, res){
  res.render('index', { title: preTitle + 'Log In', error: req.query.error });
};

/* register form */
exports.register = function(req, res){
	res.render('register', {
		title: preTitle + 'Sign Up',
		error: req.query.error
	});
};

/* confirm successful registration */
exports.registerSuccess = function(req, res, user){
	res.render('regSucc', {
		title: preTitle + 'Registration Successful',
		username: user
	});
};

/* home page */
exports.home = function(req, res, imgPath){
	console.log('imgPath (from routes/index.js): ' + imgPath);
	res.render('home', {
		title: preTitle + 'Home',
		path: imgPath,
		error: req.query.error
	});
};


/* image upload page */
exports.upload = function(req, res){
	res.render('upload', {
		title: preTitle + 'Upload a Picture',
		error: req.query.error
	});
};

/* confirm successful picture upload */
exports.uploadSuccess = function(req, res, path, msg){
	res.render('uploadSucc', {
		title: preTitle + 'Upload Successful',
		file: path,
		caption: msg
	});
};

/* category index page */
exports.catIndex = function(req, res, recentPics){ //recentPics
	console.log("CATINDEX: username is: " + req.session.username);
	res.render('catIndex', {
		title: preTitle + 'Categories',
		loggedin: req.session.username,
		error: req.query.error,
		funny: recentPics.funny,
		sports: recentPics.sports,
		nature: recentPics.nature,
		people: recentPics.people,
		art: recentPics.art,
		misc: recentPics.misc
	});
};

/* gallery page - contains thumbs, viewer */
exports.catViewer = function(req, res, catName, imgArray){
	res.render('catViewer', {
		title: preTitle + " " + catName,
		loggedin: req.session.username,
		name: catName,
		images: imgArray
	});
};

/* comments page for an individual picture */
exports.comments = function(req, res, picture){
	console.log("routes.comments being called");
	res.render('comments', {
		title: preTitle + " Comments for " + picture.path,
		pic: picture
	});
};