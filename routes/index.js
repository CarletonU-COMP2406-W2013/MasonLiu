var mongoose = require('mongoose')
  , db = require('../db')
  , session = require('../session')
  , fs = require('fs');
  
/* var LoginInfo = mongoose.model('LoginInfo'); */
var PicData = mongoose.model('PicData', PicData);
var preTitle = "PictureHub - ";
var latestUpload;

/* front page */
exports.index = function(req, res){
  res.render('index', { title: 'PictureHub' });
};

/* log in */
exports.login = function(req, res){
	console.log("\n== NEW LOGIN == Username: " + req.body.username + ", Password: " + req.body.password);
	session.login(req, req.body.username);
	/*new LoginInfo({
		username: req.body.username,
		password: req.body.password
	}).save(function(err){
		console.log("\n== NEW LOGIN == Username: " + req.body.username + ", Password: " + req.body.password);
		res.redirect('/home');
	});*/
	
	res.redirect('/home');
};

/* log out */
exports.logout = function(req, res){
	session.logout(req);
	res.redirect('/');
};

/* upload form submit */
exports.uploadFile = function(req, res){
	console.log(req.body);
	console.log(req.files);
	
	//latestUpload = req.files.uploadedFile.name;
	// get temporary location of file
	var tmp_path = req.files.uploadedFile.path;
	this.latestUpload = tmp_path;
	// set where file should actually exist (in this case, images directory)
	var target_path = './public/uploads/' +  req.files.uploadedFile.name;
	// move the file from the temporary location to the intended location
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		// delete the temporary file, so that the explicitly set
		// temporary upload dir does not get filled with unwanted files
		fs.unlink(tmp_path, function() {
			if (err) throw err;
			//res.render('uploadSuccess', { title: preTitle + 'Upload Successful' });
			res.redirect('/uploadSuccess');
			//res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
		});
	});
	
};

exports.uploadSuccess = function(req, res){
	res.render('uploadSucc', {
		title: preTitle + 'Upload Successful',
		file: this.lastestUpload
	});
};

/* upload page */
exports.upload = function(req, res){
	res.render('upload', {
		title: preTitle + 'Upload a Picture'
	});
};

/* login/home page */
exports.home = function(req, res){
	res.render('home', {
		title: preTitle + 'Home'
	});
};

/* go to account */
exports.myacct = function(req, res){
	res.render('myacct', {
		title: preTitle + 'My Account'
	});
};

/* register */
exports.register = function(req, res){
	res.render('register', {
		title: preTitle + 'Sign up'
	});
};

/* viewer */
exports.viewer = function(req, res){
	res.render('viewer', {
		title: preTitle + 'View Album'
	});
};



