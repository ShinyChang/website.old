
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: "Shiny", description:"", keywords:"", path: req.path });
};