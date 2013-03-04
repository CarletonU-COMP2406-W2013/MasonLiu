
var preTitle = "PictureHub - ";

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'PictureHub' });
};

/* upload a picture */
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

