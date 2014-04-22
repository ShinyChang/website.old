var Db         = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server     = require('mongodb').Server;
var BSON       = require('mongodb').BSON;
var ObjectID   = require('mongodb').ObjectID;

UserProvider = function(host, port) {
    this.db = new Db('mydb', new Server(host, port, {
        auto_reconnect: true
    }, {}));
    this.db.open(function() {});
};


UserProvider.prototype.getCollection = function(callback) {
    this.db.collection('user', function(error, user_collection) {
        if (error) callback(error);
        else callback(null, user_collection);
    });
};

UserProvider.prototype.findPage = function(page, callback) {
    page = page || 1;
    this.getCollection(function(error, user_collection) {
        if (error) callback(error)
        else {
            user_collection.find().skip((page - 1) * 10).limit(10).sort({
                _id: -1
            }).toArray(function(error, results) {
                if (error) callback(error)
                else callback(null, results)
            });
        }
    });
};

UserProvider.prototype.findTag = function(tag, callback) {
    this.getCollection(function(error, user_collection) {
        if (error) callback(error)
        else {
            user_collection.find({tag: tag}).sort({
                _id: -1
            }).toArray(function(error, results) {
                if (error) callback(error)
                else callback(null, results)
            });
        }
    });
};

UserProvider.prototype.findAll = function(sort, callback) {
    this.getCollection(function(error, user_collection) {
        if (error) callback(error)
        else {
            user_collection.find().sort({
                _id: sort
            }).toArray(function(error, results) {
                if (error) callback(error)
                else callback(null, results)
            });
        }
    });
};

UserProvider.prototype.count = function(callback) {
    this.getCollection(function(error, user_collection) {
        if (error) callback(error)
        else {
            return user_collection.count(function(err, count){
              callback(count);
            });
        }
    });
};

UserProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, user_collection) {
        if (error) callback(error)
        else {
            user_collection.findOne({
                _id: user_collection.db.bson_serializer.ObjectID.createFromHexString(id)
            }, function(error, result) {
                if (error) callback(error)
                else callback(null, result)
            });
        }
    });
};

UserProvider.prototype.save = function(user, callback) {
    this.getCollection(function(error, user_collection) {
        if (error) callback(error)
        else {
            user_collection.insert(user, function() {
                callback(null, user);
            });
        }
    });
};

exports.UserProvider = UserProvider;
