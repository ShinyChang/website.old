var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

UploadProvider = function(host, port) {
    this.db = new Db('mydb', new Server(host, port, {auto_reconnect: true }, {}));
    this.db.open(function() {});
};


UploadProvider.prototype.getCollection = function(callback) {
    this.db.collection('upload', function(error, upload_collection) {
        if (error) callback(error);
        else callback(null, upload_collection);
    });
};

UploadProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, upload_collection) {
        if (error) callback(error)
        else {
            upload_collection.find().sort({
                _id: -1
            }).toArray(function(error, results) {
                if (error) callback(error)
                else callback(null, results)
            });
        }
    });
};


UploadProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, upload_collection) {
        if (error) callback(error)
        else {
            upload_collection.findOne({
                _id: upload_collection.db.bson_serializer.ObjectID.createFromHexString(id)
            }, function(error, result) {
                if (error) callback(error)
                else callback(null, result)
            });
        }
    });
};

UploadProvider.prototype.save = function(files, callback) {
    this.getCollection(function(error, upload_collection) {
        if (error) callback(error)
        else {
            if (typeof files.id !== "undefined") {
                files.lastUpdate = new Date;
                upload_collection.update({
                    _id: upload_collection.db.bson_serializer.ObjectID(files.id)
                }, files, function() {
                    callback(null, files);
                });
            } else {
                files.lastUpdate = new Date;
                upload_collection.insert(files, function() {
                    callback(null, files);
                });
            }

        }
    });
};

exports.UploadProvider = UploadProvider;
