var mongoose = require('mongoose')
  //, db = require('../db')
  //, session = require('../session')
  //, bcrypt = require("bcrypt-nodejs")
  , fs = require('fs');
  
var preTitle = "PictureHub - ";

/* front page */
exports.index = function(req, res){
  res.render('index', { title: 'PictureHub', error: req.query.error });
};

/* confirm successful picture upload */
exports.uploadSuccess = function(req, res, path){
	res.render('uploadSucc', {
		title: preTitle + 'Upload Successful',
		file: path
	});
};

/* confirm successful registration */
exports.registerSuccess = function(req, res, user){
	res.render('regSucc', {
		title: preTitle + 'Registration Successful',
		username: user
	});
};

/* upload page */
exports.upload = function(req, res){
	res.render('upload', {
		title: preTitle + 'Upload a Picture'
	});
};

/* home page */
exports.home = function(req, res, imgPath){
	console.log('imgPath (from routes/index.js): ' + imgPath);
	res.render('home', {
		title: preTitle + 'Home',
		path: imgPath
	});
};

/* go to account *** NO LONGER IN USE *** */
exports.myacct = function(req, res){
	res.render('myacct', {
		title: preTitle + 'My Account'
	});
};

/* register */
exports.register = function(req, res){
	res.render('register', {
		title: preTitle + 'Sign Up',
		error: req.query.error
	});
};


/* viewer */
exports.viewer = function(req, res){
	res.render('viewer', {
		title: preTitle + 'View Album'
	});
};



