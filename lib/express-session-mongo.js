/**
* Based on the following classes:
* https://github.com/senchalabs/connect/tree/master/lib/connect/middleware/session/memory.js
* https://github.com/ciaranj/express-session-mongodb
*/
var mongo = require('mongodb'),
    util = require(process.binding('natives').util ? 'util' : 'sys'),
    Session = require('express').session,
    Db = mongo.Db,
    Server = mongo.Server;

var MongoStore = function (options) {
    'use strict';

    options = options || {};
    Session.Store.call(this, options);

    var self = this,
        server,
        db = options.db || 'express-sessions',// dbName = options.db || 'express-sessions',
        ip = options.ip || '127.0.0.1',
        port = options.port || 27017,
        fsync = (typeof options.fsync !== 'undefined') ? options.fsync : false,
        nativeParser = (typeof options.native_parser !== 'undefined') ? options.native_parser : true;

    self._collection = options.collection || 'sessions';

    if (db && typeof db === 'string') { //if db is passed in as dbName
        if (options.server) {
            server = options.server;
        } else {
            server = new Server(ip, port, {auto_reconnect: true}, {});
        }
        // treat db as dbName
        self._db = new Db(db, server, {fsync: fsync, native_parser: nativeParser});
        openMongoConn(self._db);
    } else if (db && db instanceof Db) { //
        self._db = db;

        if (self._db.state !== 'connected') {
            openMongoConn(self._db);
        }
    }
};

util.inherits(MongoStore, Session.Store);

MongoStore.prototype.set = function (sid, sess, fn) {
    'use strict';
    this._db.collection(this._collection, function (err, collection) {
        collection.findOne({ _sessionid: sid }, function (err, session_data) {
            if (err && fn) {
                fn(err);
            } else {
                sess._sessionid = sid;
                var method = 'insert';
                if (session_data) {
                    sess.lastAccess = new Date();
                    method = 'save';
                }
                collection[method](sess, function (err, document) {
                    if (!err && fn) {
                        fn(null, sess);
                    }
                });
            }
        });
    });
};

MongoStore.prototype.get = function (sid, fn) {
    'use strict';
    this._db.collection(this._collection, function (err, collection) {
        collection.findOne({ _sessionid: sid }, function (err, session_data) {
            if (err && fn) {
                fn(err);
            } else {
                if (session_data) {
                    session_data = cleanSessionData(session_data);
                }
                fn && fn(null, session_data);
            }
        });
    });
};

MongoStore.prototype.destroy = function (sid, fn) {
    'use strict';
    this._db.collection(this._collection, function (err, collection) {
        collection.remove({ _sessionid: sid }, function () {
            fn && fn();
        });
    });
};

MongoStore.prototype.length = function (fn) {
    'use strict';
    this._db.collection(this._collection, function (err, collection) {
        collection.count(function (count) {
            fn && fn(null, count);
        });
    });
};

MongoStore.prototype.all = function () {
    'use strict';
    var arr = [];
    this._db.collection(this._collection, function (err, collection) {
        collection.find(function (err, cursor) {
            cursor.each(function (d) {
                d = cleanSessionData(d);
                arr.push(d);
            });
            fn && fn(null, arr);
        });
    });
};

MongoStore.prototype.clear = function () {
    'use strict';
    this._db.collection(this._collection, function(err, collection) {
        collection.remove(function() {
            fn && fn();
        });
    });
};

var cleanSessionData = function (json) {
    'use strict';
    var data = {},
        i = 0;
    for (i in json) {
        data[i] = json[i];
        if (data[i] instanceof Object) {
            if ('low_' in data[i] || 'high_' in data[i]) {
                data[i] = data[i].toNumber();
            }
        }
    }
    return data;
};

function openMongoConn(db) {
    'use strict';
    db.open(function (err) {
        if (err) {
            throw err;
        }
    });
}

module.exports = MongoStore;
