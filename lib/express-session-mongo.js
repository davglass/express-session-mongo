/**
* Based on the following classes:
* https://github.com/senchalabs/connect/tree/master/lib/connect/middleware/session/memory.js
* https://github.com/ciaranj/express-session-mongodb
*/
var mongo = require('mongodb'),
    util = require(process.binding('natives').util ? 'util' : 'sys'),
    Session = require('express-session'),
    Db = mongo.Db,
    Connection = mongo.Connection,
    Server = mongo.Server,
    BSON = mongo.BSONNative;

var MongoStore = function(options) {
    options = options || {};
    Session.Store.call(this, options);
    
    var server,
        dbName = (options.db) ? options.db : 'express-sessions',
        ip = (options.ip) ? options.ip : '127.0.0.1',
        port = (options.port) ? options.port : 27017,
        fsync = (typeof options.fsync !== 'undefined') ? options.fsync : false,
        nativeParser = (typeof options.native_parser !== 'undefined') ? options.native_parser : true;

    this._collection = (options.collection) ? options.collection : 'sessions';

    if (options.server) {
        server = options.server;
    } else {
        server= new Server(ip, port, {auto_reconnect: true}, {});
    }

    this._db = new Db(dbName, server, {fsync: fsync, native_parser: nativeParser});
    this._db.open(function(err, db) {
        if (options.username && options.password) {
            db.authenticate(options.username, options.password, function(err, results) {
                (options.authenticated || function() {})(err, results);
            });
        }
    });
};

util.inherits(MongoStore, Session.Store);

MongoStore.prototype.set = function(sid, sess, fn) {
    this._db.collection(this._collection, function(err, collection) {
        collection.findOne({ _sessionid: sid }, function(err, session_data) {
            if (err) {
                fn && fn(err);
            } else {
                sess._sessionid = sid;
                var method = 'insert';
                if (session_data) {
                    sess.lastAccess = new Date()
                    method = 'save';
                }
                collection[method](sess, function(err, document) {
                    if (err) {
                    } else { 
                        fn && fn(null, sess);
                    }
                });
            }
        });
    });
};

MongoStore.prototype.get = function(sid, fn) {
    this._db.collection(this._collection, function(err, collection) {
        collection.findOne({ _sessionid: sid }, function(err, session_data) {
            if (err) {
                fn && fn(err);
            } else { 
                if (session_data) {
                    session_data = cleanSessionData(session_data);
                }
                fn && fn(null, session_data);
            }
        });
    });
};

MongoStore.prototype.destroy = function(sid, fn) {
    this._db.collection(this._collection, function(err, collection) {
        collection.remove({ _sessionid: sid }, function() {
            fn && fn();
        });
    });
};

MongoStore.prototype.length = function(fn) {
    this._db.collection(this._collection, function(err, collection) {
        collection.count(function(count) {
            fn && fn(null, count);
        });
    });
};

MongoStore.prototype.all = function() {
    var arr = [];
    this._db.collection(this._collection, function(err, collection) {
        collection.find(function(err, cursor) {
            cursor.each(function(d) {
                d = cleanSessionData(d);
                arr.push(d);
            });
            fn && fn(null, arr);
        });
    });
};

MongoStore.prototype.clear = function(fn) {
    this._db.collection(this._collection, function(err, collection) {
        collection.remove(function() {
            fn && fn();
        });
    });
};

var cleanSessionData = function(json) {
    var data = {};
    for (var i in json) {
        data[i] = json[i];
        if (data[i] instanceof Object) {
            if ('low_' in data[i] || 'high_' in data[i]) {
                data[i] = data[i].toNumber();
            }
        }
        
    }
    return data;
};

module.exports = MongoStore;
