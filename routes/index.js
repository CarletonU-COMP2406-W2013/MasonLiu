
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'PictureHub' });
};

/* upload a picture */
exports.upload = function(req, res){
	res.render('upload', {
		title: 'Picture uploaded'
	});
};