var OAuth2 = require('simple-oauth2')(config.oauth.github);
var https = require('https');

exports.github = function(req, res) {
    res.redirect(OAuth2.AuthCode.authorizeURL(config.oauth.github));
};

exports.callback = function(req, res) {
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
};
