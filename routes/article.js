/*
 * GET home page.
 */
exports.list = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.getAllTag(function(tag){
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
                    title: lang.articleList,
                    session: req.session,
                    description: desc,
                    keywords: lang.siteName,
                    path: '/article',
                    articles: article,
                    next: next,
                    prev: prev,
                    tagList: tag
                });
            });
        });
    });
};

exports.tag = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.getAllTag(function(tag){
        articleProvider.count(function(count) {
            articleProvider.findTag(req.params.tag, function(error, article) {

                var desc = "";
                for (var o in article) {
                    desc += article[o].title + " ";
                }
                if (desc === "") {
                    res.render('not_found', {
                        session: req.session,
                        title: "標籤：" + 　req.params.tag + "沒有找到任何文章",
                        description: "標籤：" + 　req.params.tag + "沒有找到任何文章",
                        keywords: lang.siteName,
                        path: '/article'
                    });
                    return;
                }
                res.render('article_list', {
                    title: "標籤：" + 　req.params.tag,
                    session: req.session,
                    keywords: lang.siteName,
                    description: desc,
                    path: '/article',
                    articles: article,
                    next: 0,
                    prev: 0,
                    tagList: tag
                });
            });
        });
    });
};

exports.new = function(req, res) {
    if (config.adminID !== req.session.userID) {
        res.redirect("/article/list");
        return;
    }

    articleProvider = req.articleProvider;
    articleProvider.save({
        title: 'untitled',
        context: ''
    }, function(error, docs) {
        res.redirect('/article/edit/' + docs._id);
    });
};

exports.edit = function(req, res) {
    if (config.adminID !== req.session.userID) {
        res.redirect("/article/" + req.params.id);
        return;
    }

    articleProvider = req.articleProvider;
    uploadProvider = req.uploadProvider;
    uploadProvider.findNewest(18, function(error, files) {
        articleProvider.findById(req.params.id, function(error, article) {
            res.render('edit', {
                title: article.title,
                session: req.session,
                description: '',
                keywords: lang.siteName,
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
        intro: req.body.intro,
        md: req.body.md,
        tag: req.body['hidden-tags'].toLowerCase().split(",")
    }, function(error, docs) {
        res.redirect('/article/' + docs.id);
    });
};

exports.show = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.findById(req.params.id, function(error, article) {
        if (!article) {
            res.render('not_found', {
                session: req.session,
                keywords: lang.siteName,
                title: lang.articleNotFound,
                description: "文章編號：" + 　req.params.id + "不存在",
                path: '/article'
            });
            return;
        }
        articleProvider.findNext(article.id, function(error, next){
            articleProvider.findPrev(article.id, function(error, prev){
                res.render('article', {
                    title: article.title,
                    session: req.session,
                    keywords: article.tag.join(","),
                    description: article.context.replace(/(<([^>]+)>)/ig, ""),
                    path: '/article',
                    article: article,
                    next: next,
                    prev: prev
                });
            });
        });
    });
};

exports.archive = function(req, res) {
    articleProvider = req.articleProvider;
    articleProvider.findAll(-1, function(error, article) {
        var desc = "",
            list = [];
        for (var o in article) {
            desc += article[o].title + " ";
        }

        article.forEach(function(item) {
            if (!item.createTime) {
                return;
            }
            var year = item.createTime.getFullYear();

            list[year] = list[year] || [];
            list[year].push(item);
        });

        res.render('archive', {
            title: lang.articleList,
            session: req.session,
            description: desc,
            keywords: lang.siteName,
            path: '/article/archive',
            list: list
        });
    });
};
