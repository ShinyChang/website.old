/**
 * Module dependencies.
 */

var ArticleProvider = require('./modal/articleProvider').ArticleProvider;
var articleProvider = new ArticleProvider('localhost', 27017);

var UploadProvider = require('./modal/uploadProvider').UploadProvider;
var UploadProvider = new UploadProvider('localhost', 27017);

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
upload.on('end', function(info){
    UploadProvider.save(info, function( error, record) {
        console.log(record);
    });
});
upload.on('error', function (e) {
    console.log(e.message);
});




var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();
app.disable('x-powered-by'); // remove header x-powered-by information
app.configure(function () {
    app.use('/upload', upload.fileHandler());
    app.use(express.bodyParser());
});
app.locals({
    timeDiff: function(dateString) {
        var day  = 60 * 60 * 24,
            hour = 60 * 60,
            min  = 60;

        var diff = Math.round((new Date() - new Date(dateString)) / 1000);
        if (diff >= day) {
            return Math.round(diff / day) + " 天前";
        } else if (diff >= hour) {
            return Math.round(diff / hour) + " 小時前";
        } else if (diff >= min) {
            return Math.round(diff / min) + " 分鐘前";
        } else {
            return "剛剛";
        }
    },
    dateString: function(date) {
        var d = new Date(date);
        return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + (d.getDate()) + "日";
    }
});


// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// app.get('/', routes.index);
app.get('/',  function(req, res){
res.redirect('/article/list/');
});
app.get('/about', user.about);
app.get('/users', user.list);
app.get('/upload', function(req, res) {
    res.redirect('/article/list');
});

app.get('/article/new', function(req, res){
    articleProvider.save({
        title: 'untitled',
        context: ''
    }, function( error, docs) {
        res.redirect('/article/edit/' + docs._id);
    });
});

app.get('/article/edit/:id', function(req, res) {
    UploadProvider.findAll(function(error, files) {
        articleProvider.findById(req.params.id, function(error, article) {
            res.render('edit', {
                title: article.title,
                path: '/article',
                article: article,
                files: files
            });
        });
    });
});

app.post('/article/edit/:id', function(req, res){
    articleProvider.save({
        id: req.params.id,
        title: req.body.title,
        context: req.body.context,
        tag: req.body['hidden-tags'].toLowerCase().split(",")
    }, function( error, docs) {
        res.redirect('/article/' + docs.id);
    });
});

app.get('/article/list', function(req, res){
    articleProvider.count(function(count){
        articleProvider.findAll(req.query.page, function(error, article) {
            var totalPage = Math.ceil(count / 10),
                currPage = req.query.page ? parseInt(req.query.page, 10) : 1;

            var next = 0,
                prev = 0;
            if (totalPage > currPage) {
                next = currPage + 1;
                if (currPage > 1) {
                    prev = currPage - 1;
                }
            } else if(totalPage === currPage) {
                if (currPage > 1) {
                    prev = currPage - 1;
                }
            }

            var desc = "";
            for(var o in article) {
                desc += article[o].title + " ";
            }
            res.render('article_list', {
                title: "文章列表",
                description: desc,
                path: '/article',
                articles: article,
                next:next,
                prev:prev
            });
        });
    });
});

app.get('/article/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('article', {
            title: article.title,
            description: article.context.replace(/(<([^>]+)>)/ig,""),
            path: '/article',
            article: article
        });
    });
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
