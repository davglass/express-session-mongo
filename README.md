# MongoDB Session Storage for ExpressJS

This module is an addon for ExpressJS that adds a new Session Storage device.

## Install

    npm install https://github.com/trottski/express-session-mongo/archive/master.tar.gz

## Usage

The standard usage, is to just pass an instantiated `MongoStore` instance to the session plugin. 

    var xp = require('express'),
        MongoStore = require('express-session-mongo');

    var app = xp.createServer();

    app.configure(function(){
        app.use(xp.cookieDecoder());
        app.use(xp.session({ store: new MongoStore() }));
        app.use(app.router);
    });

You can also pass several options to the constructor to tweak your session store:

* db - The name of the db to use, defaults to: `express-sessions`
* ip - The IP address of the server to connect to, defaults to: `127.0.0.1`
* port - The Port to connect to, defaults to: `27017`
* collection - The collection to save it's data to, defaults to: `sessions`
* server - A custom mongo Server instance (this overides db, ip &amp; port):
* fsync - Confirm writes after they have been flushed to disk, default: false.
* native_parser - Use BSON native parser, defaults to: true.
* username - The username for the database.
* password - The password which corresponds to the database
* authenciated - An err-first callback that fires once connected and an auth attempt is made.

<pre><code>var CustomServer = new Server(123.456.789.1, 12345, { auto_reconnect: true }, {});
app.use(xp.session({ store: new MongoStore({ server: CustomServer }) }));</code></pre>

## Removing stale sessions

MongoDB 2.2 and above supports doing this via an index, see http://docs.mongodb.org/manual/tutorial/expire-data/
To enable this, run

    db.sessions.ensureIndex( { "lastAccess": 1 }, { expireAfterSeconds: 3600 } )

Mongo will now remove all sessions older than an hour (every 60 seconds).

## Changes from davglass/express-session-mongo

1. Removes connect as a dependency
2. Adds fsync and native_parser options to constructor
3. Removes manual session cleanup cleanup code (see Removing stale sessions below)


## License

Licensed under my standard BSD license.

### Based on these classes

* [Sencha Connect Memory Store](https://github.com/senchalabs/connect/tree/master/lib/connect/middleware/session/memory.js)
* [ciaranj's express-session-mongodb](https://github.com/ciaranj/express-session-mongodb)
