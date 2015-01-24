var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var comments = JSON.parse(fs.readFileSync('_comments.json'));


app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/comments.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(comments));
});

app.post('/comments.json', function(req, res) {
    var data = req.body;
    data.timestamp = Date.now();
    comments.push(data);
    // fs.writeFile('_comments.json', JSON.stringify(comments));
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(comments));
});

module.exports = app;


