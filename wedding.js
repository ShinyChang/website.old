var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var comments = JSON.parse(fs.readFileSync('_comments.json'));


app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


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
    fs.writeFile('_comments.json', JSON.stringify(comments));
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(comments));
});

app.get('/reward', function(req, res) {
    var rewardList = [];
    var keyMap = {};
    for (var i = comments.length - 1; i >= 0; i--) {
        if (typeof keyMap[comments[i].id] === 'undefined') {
            rewardList.push(comments[i]);
            keyMap[comments[i].id] = rewardList.length - 1;
            rewardList[rewardList.length - 1].count = 1;
        } else {
            rewardList[Object.keys(keyMap).indexOf(comments[i].id)].count++;
        }
    };

    // shuffle
    for (var i = rewardList.length - 1; i >= 0; i--) {

        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = rewardList[randomIndex];

        rewardList[randomIndex] = rewardList[i];
        rewardList[i] = itemAtIndex;
    }
    // rewardList = rewardList.slice(0, 5);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(rewardList));
});

module.exports = app;
