var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var vhost = require('vhost');
var app = module.exports = express();
var privateKey  = fs.readFileSync('shinychang_net.key', 'utf8');
var certificate = fs.readFileSync('shinychang_net.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

app.use(vhost('*.shinychang.net', require('./blog.js')));
app.use(vhost('shinychang.net', require('./blog.js')));

var httpsServer = https.createServer(credentials, app);

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

httpsServer.listen(443);

