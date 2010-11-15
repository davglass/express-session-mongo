# MongoDB Session Storage for ExpressJS

This module is an addon for ExpressJS that adds a new Session Storage device.


## Install

    npm install express-session-mongo

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

    var CustomServer = new Server(123.456.789.1, 12345, { auto_reconnect: true }, {});
    app.use(xp.session({ store: new MongoStore({ server: CustomServer }) }));


## License

Licensed under my standard BSD license.

## Based on these classes

   [sencha]: https://github.com/senchalabs/connect/tree/master/lib/connect/middleware/session/memory.js (Sencha Connect Memory Store)
   [ciaranj]: https://github.com/ciaranj/express-session-mongodb (ciaranj's express-session-mongodb)
