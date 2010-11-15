#!/usr/bin/env node

//Needed for monit/upstart
process.chdir(__dirname);

var xp = require('express'),
    MongoStore = require('express-session-mongo');

var app = module.exports = xp.createServer();

app.configure(function(){
    app.use(xp.cookieDecoder());
    app.use(xp.session({ store: new MongoStore() }));
    app.use(app.router);
});

app.get('/', function(req, res) {
    res.send('HERE');
});

app.listen(8080);

