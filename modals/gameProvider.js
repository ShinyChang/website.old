var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

GameProvider = function(host, port) {
    this.db = new Db('mydb', new Server(host, port, {auto_reconnect: true }, {}));
    this.db.open(function() {});
};


GameProvider.prototype.getCollection = function(callback) {
    this.db.collection('game', function(error, game_collection) {
        if (error) callback(error);
        else callback(null, game_collection);
    });
};

GameProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, game_collection) {
        if (error) callback(error)
        else {
            game_collection.find().sort({
                _id: -1
            }).toArray(function(error, results) {
                if (error) callback(error)
                else callback(null, results)
            });
        }
    });
};

GameProvider.prototype.save = function(record, callback) {
    this.getCollection(function(error, game_collection) {
        if (error) callback(error)
        else {
            record.createTime = new Date;
            game_collection.insert(record, function() {
                callback(null, record);
            });
        }
    });
};

exports.GameProvider = GameProvider;
