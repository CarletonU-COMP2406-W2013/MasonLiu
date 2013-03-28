Files
=====

/ (main directory):

app.js - main application start point
db.js 	- interface for database
		used to store user account information and picture metadata

/public/javascripts/ :

catBtn.js 	- 	map the buttons to different pages via JQuery functions
homeBtn.js 	- 	map the buttons to different pages via JQuery functions
lightbox.js - 	(Part of Lightbox2 package) modified the image and viewer to resize to different
				maximum width/height values
	
/public/stylesheets/:

style.styl - Main css for all pages
lightbox.css - (Part of Lightbox2 package) modified the image viewer to have different maximum width/height values
	
/public/uploads/:
	<user uploaded image files go here>
	
/routes:
	index.js - page routing
	
/views:
	layout.jade - link in css, client side javascript to all pages, and show navbar
	index.jade - front page, with login form, access to registration form, categories
	register.jade - register form; asks for user name, password, categories to track
	regSucc.jade - page to notify user of successful registration
	home.jade - home page, default page when user is logged in; displays recent uploads for tracked users & categories
	catIndex.jade - provides access to each category gallery, shows most recent uploads of each category
	catViewer.jade - displays a category gallery; pictures are organized in rows, and any picture may be clicked on to open the viewer
	upload.jade - upload form; asks for the image file, associated categories, caption
	uploadSucc.jade - page to notify user of successful upload