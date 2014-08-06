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
    start: true
});
