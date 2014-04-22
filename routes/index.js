/*
 * GET home page.
 */
exports.index = function(req, res) {
    console.log(req.session.userID);
    res.render('index', {
        title: "Shiny",
        session: req.session,
        description: "",
        keywords: "",
        path: req.path
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

