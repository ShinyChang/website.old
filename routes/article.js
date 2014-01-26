/*
 * GET home page.
 */
exports.list = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.count(function(count) {
        articleProvider.findPage(req.query.page, function(error, article) {
            var totalPage = Math.ceil(count / 10),
                currPage = req.query.page ? parseInt(req.query.page, 10) : 1;

            var next = 0,
                prev = 0;
            if (totalPage > currPage) {
                next = currPage + 1;
                if (currPage > 1) {
                    prev = currPage - 1;
                }
            } else if (totalPage === currPage) {
                if (currPage > 1) {
                    prev = currPage - 1;
                }
            }

            var desc = "";
            for (var o in article) {
                desc += article[o].title + " ";
            }
            res.render('article_list', {
                title: "文章列表",
                description: desc,
                path: '/article',
                articles: article,
                next: next,
                prev: prev
            });
        });
    });
};

exports.new = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.save({
        title: 'untitled',
        context: ''
    }, function(error, docs) {
        res.redirect('/article/edit/' + docs._id);
    });
};

exports.edit = function(req, res) {
    articleProvider = req.articleProvider;
    uploadProvider = req.uploadProvider;
    uploadProvider.findAll(function(error, files) {
        articleProvider.findById(req.params.id, function(error, article) {
            res.render('edit', {
                title: article.title,
                path: '/article',
                article: article,
                files: files
            });
        });
    });
};

exports.postEdit = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.save({
        id: req.params.id,
        title: req.body.title,
        context: req.body.context,
        tag: req.body['hidden-tags'].toLowerCase().split(",")
    }, function(error, docs) {
        res.redirect('/article/' + docs.id);
    });
};

exports.show = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('article', {
            title: article.title,
            description: article.context.replace(/(<([^>]+)>)/ig, ""),
            path: '/article',
            article: article
        });
    });
};
