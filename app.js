/**
 * Module dependencies.
 */

var ArticleProvider = require('./modals/articleProvider').ArticleProvider;
var articleProvider = new ArticleProvider('localhost', 27017);

var UploadProvider = require('./modals/uploadProvider').UploadProvider;
var uploadProvider = new UploadProvider('localhost', 27017);

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

// require locals
var lib = require('./locals/lib').lib;
var lang = require('./locals/lang').lang;

var http = require('http');
var path = require('path');

var app = express();
app.disable('x-powered-by'); // remove header x-powered-by information
app.configure(function() {
    app.use('/upload', upload.fileHandler());
    app.use(express.bodyParser());
});
app.locals({
    lang: lang,
    lib: lib
});


// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.csrf());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// global controller
app.all('/*', function(req, res, next) {
    res.header('X-XSS-Protection', 0); // disable X-XSS-Protection
    res.locals.csrf = req.session ? req.csrfToken() : ""; // CSRF
    req.articleProvider = articleProvider;
    req.uploadProvider = uploadProvider;
    next();
});

// sitemap
app.get('/sitemap.xml', index.sitemap);
app.get('/rss', index.rss);


// index not implement, redirect to article list
app.get('/', function(req, res) {
    res.redirect('/article/list/');
});

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
app.get('/article/archive', article.archive);
app.get('/article/:id', article.show);


// weather
app.get('/weather', function(req, res){
    res.render('playground/weather');
});



// server error
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send('500', 'Something broke!');
});

// page not found
app.use(function(req, res, next) {
    res.render('404', {
        status: 404
    });
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});




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
    start: true,
    timeZone: "Asia/Taipei"
})
