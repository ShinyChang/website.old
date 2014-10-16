exports.index = function(req, res) {
    var articleProvider = req.articleProvider;
    articleProvider.findPage(1, function(error, article) {
        var desc = "";
        res.render('index', {
            title: lang.home,
            session: req.session,
            description: "我是Shiny，主要語言PHP、JavaScript與CSS，自學Node.js中…",
            keywords: "Shiny, PHP, JavaScript, Node.js",
            path: req.path,
            articles: article
        });
    });
};

exports.sitemap = function(req, res) {
    var articleProvider = req.articleProvider;
    articleProvider.findAll(-1, function(error, article) {
        res.header('Content-Type', 'application/xml');
        res.render('sitemap', {
            articles: article,
            page: Math.ceil(article.length / 10)
        });
    });
}

exports.feed = function(req, res) {
    var articleProvider = req.articleProvider;
    articleProvider.findAll(-1, function(error, article) {
        res.header('Content-Type', 'application/xml');
        res.render('rss', {
            articles: article
        });
    });
}

exports.rss = function(req, res) {
    var articleProvider = req.articleProvider;
    articleProvider.findPage(1, function(error, article) {
        res.header('Content-Type', 'application/xml');
        res.render('rss', {
            articles: article
        });
    });
}

exports.logout = function(req, res) {
    req.session.userID = undefined;
    req.session.userName = undefined;
    res.redirect("/");
}

