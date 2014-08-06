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
var oauth = require('./routes/oauth');

var http = require('http');
var path = require('path');

var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');
var fs = require('fs');
var logFile = fs.createWriteStream('./log.txt', {
    flags: 'a'
});

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
app.use(logger({
    stream: logFile
}));
app.use(cookieParser(config.secret));
app.use(session());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(csrf());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === config.env) {
    app.use(require('errorhandler')());
}

// global controller
app.all('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null) {
        res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
        return;
    }
    res.locals.csrf = req.session ? req.csrfToken() : ""; // CSRF
    req.articleProvider = articleProvider;
    req.uploadProvider = uploadProvider;
    req.userProvider = userProvider;
    next();
});



// index not implement, redirect to article list
app.get('/', index.index);
app.get('/about', user.about);
app.get('/sitemap.xml', index.sitemap);
app.get('/rss', index.rss);
app.get('/logout', index.logout);

// login
app.get('/oauth/github', oauth.github);
app.get('/oauth/callback', oauth.callback);

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

module.exports = app;
