var cheerio = require('cheerio'),
    http = require('http'),
    https = require('https');

var directories = [{dir: "esomar", url: "directory.esomar.org", https: true}];

var getDirectory = function (directoryName) {
    try {
        // If directory not specified by the user
        if (directoryName === undefined) throw 404;

        // Counter of value mismatch
        var counter = 0;
        // Loop through the preset company directories folder
        for (var i = 0; i < directories.length; i++) {
            if (directories[i].dir === directoryName) {
                counter++;
                return directories[i];
            }
        }

        // If counter not increased from 0
        // then directory doesn't exists
        if (!counter) throw 404;
    }
    catch (err) {
        return err;
    }
};

var scrapShit = function (data) {
    //var $ = cheerio.load(data);
    return "Yo";
};

var scraper = {
    extractEmail: function (directoryName) {
        var result = getDirectory(directoryName);
        if (result !== 404) {
            var protocol = result.https ? https : http;
            protocol.request({
                host: 'somevalue.net',
                method: "GET"
            }, function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function () {
                    return data;
                });
            })
                .on('error', function (err) {
                    return err;
                })
                .end();
            //return data;
        }
        else {
            //return "Failed";
        }
    }
};

module.exports = scraper;