/*
 * GET users listing.
 */

exports.list = function(req, res) {
    res.send("respond with a resource");
};

exports.about = function(req, res) {
    res.render('about', {
        title: lang.about,
        session: req.session,
        description: "",
        keywords:"",
        path: req.path,
        experiences: [
        	{location: "台灣數位學習科技股份有限公司", url:"http://www.powercam.com.tw/", job: "工程師", startDate: "2012-09", endDate: ""},
        	{location: "國立臺中科技大學", url: "http://www.nutc.edu.tw/", job: "資訊工程（碩士）", startDate: "2010-09", endDate: "2012-07"},
        	{location: "國立臺中技術學院", url: "http://www.nutc.edu.tw/", job: "資訊工程（學士）", startDate: "2006-09", endDate: "2010-06"}
        ]
    });
};
