var querystring = require("querystring"),
	fs = require("fs"),
	formidable = require("formidable");

var FrontPage = (function(FrontPage, $, undefined){

	//functions passed directly into $ will run when document is ready
	$(function(){
	
		// jquery objects
		var uploadForm = $("#upload-form");
		
		// upload a picture
		/*
		uploadForm.on("submit", function(){
			var form = new formidable.IncomingForm();
			console.log("about to parse");
			form.parse(request, function(error, fields, files) {
				console.log("parsing done");*/
			
				/*	Possible error on Windows systems:
					tried to rename to an already existing file */
				/*
				fs.rename(files.upload.path, "./test.png", function(err) {
				if (err) {
					fs.unlink("./test.png");
					fs.rename(files.upload.path, "./test.png");
				}
			});
		}*/
	});
	
})(FrontPage || {}, $);