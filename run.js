var express = require('express');
var vhost = require('vhost');
var app = module.exports = express();

app.use(vhost('github.shinychang.net', require('./github.js')));
app.use(vhost('wedding.shinychang.net', require('./wedding.js')));
app.use(vhost('*.shinychang.net', require('./blog.js')));
app.use(vhost('shinychang.net', require('./blog.js')));
app.listen(80);
