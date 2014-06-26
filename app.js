/**
 * Module dependencies.
 */
GLOBAL.lang = require('./locals/lang').lang;
GLOBAL.config = require('./config').config;

var ArticleProvider = require('./modals/articleProvider').ArticleProvider;
var articleProvider = new ArticleProvider('localhost', 27017);

var UploadProvider = require('./modals/uploadProvider').UploadProvider;
var uploadProvider = new UploadProvider('localhost', 27017);

var UserProvider = require('./modals/userProvider').UserProvider;
var userProvider = new UserProvider('localhost', 27017);

var GameProvider = require('./modals/gameProvider').GameProvider;
var gameProvider = new GameProvider('localhost', 27017);

var express = require('express');
var upload = require('jquery-file-upload-middleware');

// configure upload middleware
upload.configure({
    uploadDir: __dirname + '/public/uploads',
    uploadUrl: '/uploads',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    }
});

// {name, originalName, size, type, deleteType, url, deleteUrl}
upload.on('end', function(info) {
    uploadProvider.save(info, function(error, record) {
        console.log(record);
    });
});
upload.on('error', function(e) {
    console.log(e.message);
});







// require routers
var routes = require('./routes');
var user = require('./routes/user');
var index = require('./routes/index');
var article = require('./routes/article');


var http = require('http');
var path = require('path');
var https = require('https');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');
var fs = require('fs');
var logFile = fs.createWriteStream('./log.txt', {flags: 'a'}); //use {flags: 'w'} to open in write mode

var app = express();
app.disable('x-powered-by'); // remove header x-powered-by information
app.use('/upload', upload.fileHandler());

app.locals = {
    lib: require('./locals/lib').lib
};


// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(express.favicon());
app.use(logger({stream: logFile}));
app.use(cookieParser(config.secret));
app.use(session());
app.use(bodyParser());
app.use(csrf());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === config.env) {
    app.use(require('errorhandler')());
}

//game code
app.get('/2048record', function(req, res){
    gameProvider = req.gameProvider;
    var record = {
        step: req.query.step,
        bonus_max_tile_in_corner: req.query.bonus_max_tile_in_corner,
        bonus_calc_lines: req.query.bonus_calc_lines,
        bonus_weight_minus: req.query.bonus_weight_minus,
        max_tile: req.query.max_tile,
        score: req.query.score
    }
    gameProvider.save(record, function(error, record) {
        res.render(JSON.stringify("ok"));
    });
});

app.get('/2048result', function(req, res){
    gameProvider = req.gameProvider;
    gameProvider.findAll(info, function(error, record) {
        res.render(JSON.stringify(record));
    });
});

var OAuth2 = require('simple-oauth2')(config.oauth.github);

// Initial page redirecting to Github
app.get('/oauth/github', function(req, res) {
    res.redirect(OAuth2.AuthCode.authorizeURL(config.oauth.github));
});

app.get('/oauth/callback', function(req, res) {
    OAuth2.AuthCode.getToken({
        code: req.query.code,
        redirect_uri: config.oauth.github.redirect_uri
    }, function(error, result) {
        if (error) {
            console.log('Access Token Error', error.message);
        }
        token = OAuth2.AccessToken.create(result);
        https.get({
            host: "api.github.com",
            path: "/user?" + token.token,
            headers: {
                'user-agent': 'node.js'
            }
        }, function(r) {
            var body = '';
            r.on('data', function(d) {
                body += d;
            });
            r.on('end', function() {
                var githubUserInfo = JSON.parse(body);
                req.session.userID = githubUserInfo.id;
                req.session.userName = githubUserInfo.login;
                res.redirect("/");
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    });
});






// global controller
app.all('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null ) {
        res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
        return;
    }
    res.header('X-XSS-Protection', 0); // disable X-XSS-Protection
    res.locals.csrf = req.session ? req.csrfToken() : ""; // CSRF
    req.articleProvider = articleProvider;
    req.uploadProvider = uploadProvider;
    req.gameProvider = gameProvider;
    req.userProvider = userProvider;
    next();
});

// sitemap
app.get('/sitemap.xml', index.sitemap);
app.get('/rss', index.rss);
app.get('/logout', index.logout);


// index not implement, redirect to article list
app.get('/', index.index);

app.get('/about', user.about);

// upload
app.get('/upload', function(req, res) {
    res.redirect('/article/list');
});

// article
app.get('/article/new', article.new);
app.get('/article/edit/:id', article.edit);
app.post('/article/edit/:id', article.postEdit);
app.get('/article/list', article.list);
app.get('/article/tag/:tag', article.tag);
app.get('/article/archive', article.archive);
app.get('/article/:id', article.show);


// weather
app.get('/weather', function(req, res) {
    res.render('playground/weather');
});



// server error
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send('500', 'Something broke!');
});

// page not found
app.use(function(req, res, next) {
    res.render('not_found', {
        session: req.session,
        title: "Page Not Found",
        description: "Page not found.",
        path: '/article'
    });
});

app.listen(80);




// sample code
var http = require('http');
var parser = require('xml2js');
var fs = require('fs');
var cronJob = require('cron').CronJob;

var options = {
    host: 'opendata.cwb.gov.tw',
    path: '/opendata/MFC/F-C0032-001.xml'
};

callback = function(response) {
    var xml = '';

    //another chunk of data has been recieved, so append it to `xml`
    response.on('data', function(chunk) {
        xml += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function() {
        parser.parseString(xml, function(err, result) {
            fs.writeFile(path.join(__dirname, 'public') + "/playground/weather/data.json", JSON.stringify(result), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                }
            });
        });
    });
}

new cronJob({
    cronTime: '5 * * * * *',
    onTick: function() {
        http.request(options, callback).end();
    },
    start: true
});
