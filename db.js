var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

PicDB = function(host, port) {
	this.db = new Db('pichub-data', new Server(host, port, {auto_reconnect: true}), {journal: true});
	this.db.open(function(){});
	console.log("\tDB opened.");
};

/* MONGO DB */

/* MONGOOSE DB */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LoginData = new Schema({
	username: String,
	password: String
});

var PicData = new Schema({
	filename: String,
	path: String
});

var AlbumData = new Schema({
	title: String,
	pictures: [PicData]
});

mongoose.model('LoginData', LoginData);
mongoose.model('PicData', PicData);
mongoose.model('AlbumData', AlbumData);

mongoose.connect('mongodb://localhost/picture-hub');

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
