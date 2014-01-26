var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
    this.db = new Db('mydb', new Server(host, port, {
        auto_reconnect: true
    }, {}));
    this.db.open(function() {});
};


ArticleProvider.prototype.getCollection = function(callback) {
    this.db.collection('article', function(error, article_collection) {
        if (error) callback(error);
        else callback(null, article_collection);
    });
};

ArticleProvider.prototype.findPage = function(page, callback) {
    page = page || 1;
    this.getCollection(function(error, article_collection) {
        if (error) callback(error)
        else {
            article_collection.find().skip((page - 1) * 10).limit(10).sort({
                _id: -1
            }).toArray(function(error, results) {
                if (error) callback(error)
                else callback(null, results)
            });
        }
    });
};

ArticleProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, article_collection) {
        if (error) callback(error)
        else {
            article_collection.find().sort({
                _id: -1
            }).toArray(function(error, results) {
                if (error) callback(error)
                else callback(null, results)
            });
        }
    });
};

ArticleProvider.prototype.count = function(callback) {
    this.getCollection(function(error, article_collection) {
        if (error) callback(error)
        else {
            return article_collection.count(function(err, count){
              callback(count);
            });
        }
    });
};

ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
        if (error) callback(error)
        else {
            article_collection.findOne({
                _id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)
            }, function(error, result) {
                if (error) callback(error)
                else callback(null, result)
            });
        }
    });
};

ArticleProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
        if (error) callback(error)
        else {
            if (typeof articles.id !== "undefined") {
                articles.lastUpdate = new Date;
                articles.createTime = article_collection.db.bson_serializer.ObjectID(articles.id).getTimestamp();
                article_collection.update({
                    _id: article_collection.db.bson_serializer.ObjectID(articles.id)
                }, articles, function() {
                    callback(null, articles);
                });
            } else {
                articles.lastUpdate = new Date;
                article_collection.insert(articles, function() {
                    callback(null, articles);
                });
            }

        }
    });
};

exports.ArticleProvider = ArticleProvider;
