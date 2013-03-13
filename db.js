
/* NOTE *** THIS FILE NOT CURRENTLY IN USE */

/*
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
*/

var mongoose = require('mongoose');
var db;
var User, Picture, Album;

PicHubDataBase = function() {
	mongoose.connect('mongodb://localhost/picture-hub-data');
	db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {
		console.log("creating schemas...\n");
		var Schema = mongoose.Schema;
		var UserSchema = new Schema({
			username: String,
			password: String
		});
		var PicSchema = new Schema({
			filename: String,
			path: String
		});
		var AlbumSchema = new Schema({
			title: String,
			pictures: [PicSchema]
		});
	});
	
	User = mongoose.model('User', UserSchema);
	Picture = mongoose.model('Picture', PicSchema);
	Album = mongoose.model('Album', AlbumSchema);	
}

PicHubDataBase.prototype.userModel = function(){
	return User;
}

exports.PicHubDataBase = PicHubDataBase;

/*
var User, Picture, Album;


mongoose.connect('mongodb://localhost/picture-hub-data');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {
	console.log("creating schemas...\n");
	var Schema = mongoose.Schema;
	var UserSchema = new Schema({
		username: String,
		password: String
	});
	var PicSchema = new Schema({
		filename: String,
		path: String
	});
	var AlbumSchema = new Schema({
		title: String,
		pictures: [PicSchema]
	});

	User = mongoose.model('User', UserSchema);
	Picture = mongoose.model('Picture', PicSchema);
	Album = mongoose.model('Album', AlbumSchema);
});

exports.User = function(){return User;};
exports.Picture = Picture;
exports.Album = Album;*/

/* PicDB = function(host, port) {
	this.db = new Db('pichub-data', new Server(host, port, {auto_reconnect: true}), {journal: true});
	this.db.open(function(){});
	console.log("\tDB opened.");
};*/

/* mongoose.connect('mongodb://localhost/picture-hub');

PicDB.prototype.getAlbum = function getAlbum(title,callback){
	var Album = mongoose.model('Album');
	Album.find({'Title':title}, function (err, album) {
		if(err) {
			console.log(err);
		} else {
			console.log(album);
			callback("",album);
		}
	});
};

exports.PicDB = PicDB;
*/