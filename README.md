PictureHub
==========

**Members**

Nigel Mason (100837493)

Bo Liu (100682952)

**Summary**

PictureHub is a straightforward image sharing application designed to consolidate the contributions of users with similiar interests
into easily accessible categories.

From the front page, any visitor may enter a public category gallery, such as "Funny" or "Art." Clicking on any picture in the gallery 
will bring up the image viewer, enlarging the selected image, and displaying a caption, if one was provided. While the viewer is open, 
a user is able to advance forwards or backwards through the category. If a user wishes to upload their own pictures, they must register 
an account with the application. Users can upload pictures of any image format, choose categor(ies) to add the picture to, and attach a 
caption. Registered users can "track" their favourite categories, which will update the user's home page with the most recent uploads in
those categories. Similarily, users can also track other users, seeing their most recent uploads.


**How to run**

- Install node.js
- Install MongoDB
- Download application as .zip file, extract files to preferred destination
- Open a terminal, navigate to the application directory, and enter "npm install" to install the node modules
- Start the MongoDB server
- Enter "node app.js" in the application directory to start the server
- Open a browser and connect to port 3000 on localhost to use the application


**Dependencies**

Node.js modules:	
* express
* jade
* stylus
* mongodb
* mongoose
* connect-mongo
* bcrypt-nodejs
* async

	
Other packages:
* Bootstrap
* Bootstrap-Jasny (Bootstrap extension)
* JQuery 
* JQuery validate
* Lightbox2 