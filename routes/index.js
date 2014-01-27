/*
 * GET home page.
 */
exports.index = function(req, res) {
    res.render('index', {
        title: "Shiny",
        description: "",
        keywords: "",
        path: req.path
    });
};

exports.sitemap = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.findAll(function(error, article) {
        res.header('Content-Type', 'application/xml');
        res.render('sitemap', {
            articles: article,
            page: Math.ceil(article.length / 10)
        });
    });
}