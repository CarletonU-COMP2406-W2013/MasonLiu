Files
=====

*/ (main directory)*

**app.js** - application configuration, handling of get/posts


*/public/libs/lightbox*

**lightbox.js** - (Part of Lightbox2 package) modified the image and viewer to resize to different maximum width/height values

**lightbox.css** - (Part of Lightbox2 package) modified the image viewer to have different maximum width/height values


*/public/javascripts/*

**catBtn.js** - map the buttons to different actions via JQuery functions

**homeBtn.js** - map the buttons to different actions via JQuery functions 

**regValidate.js** - validate the registration form fields

	
*/public/stylesheets/*

**style.styl** - styling for all pages

**home.styl** - styling for home page

**register.styl** - styling for register page

**upload.styl** - styling for upload page

**uploadSucc.styl** - styling for upload confirmation page

**catIndex.styl** - styling for category index page

**catViewer.styl** - styling for category viewer page

	
*/routes*

**index.js** - page routing

	
*/views*

**layout.jade** - link in css, client side javascript to all pages

**navPublic.jade** - navbar as it should appear to new visitors

**navUser.jade** - navbar as it should appear to registered users

**index.jade** - front page, with login form, access to registration form, categories 

**register.jade** - register form; asks for user name, password, categories to track 

**regSucc.jade** - page to notify user of successful registration 

**home.jade** - home page, default page when user is logged in; displays recent uploads for tracked users & categories 

**catIndex.jade** - provides access to each category gallery, shows most recent uploads of each category 

**catViewer.jade** - displays a category gallery; pictures are organized in rows, and any picture may be clicked on to open the viewer 

**upload.jade** - upload form; asks for the image file, associated categories, caption 

**uploadSucc.jade** - page to notify user of successful upload

**error.jade** - page to show when errors occur that are not otherwise handled