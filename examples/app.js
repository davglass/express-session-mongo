#!/usr/bin/env node

//Needed for monit/upstart
process.chdir(__dirname);

var connect = require('connect'),
    MongoStore = require('connect-session-mongo');

var app = module.exports = connect.createServer();

app.configure(function(){
    app.use(connect.cookieDecoder());
    app.use(connect.session({ store: new MongoStore() }));
    app.use(app.router);
});

app.get('/', function(req, res) {
    res.send('HERE');
});

app.listen(8080);

