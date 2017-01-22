
var Rq = require('request-promise'),
    cheerio = require('cheerio');

var directories = [{dir: "esomar", url: "directory.esomar.org", https: true}];

/**
 * Get Individual Directory
 *
 * @param directoryName
 * @returns {*}
 */
var getDirectory = function (directoryName) {
    try {
        // If directory not specified by the user
        if (directoryName === undefined) throw 404;

        // Directory availability counter
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

var navigateAndFetchPages = function (data) {
    // console.log(data);
    // for (var i = 0; i < data.length; i++) {
    //
    // }
    return data;
};

/***
 * Landing Page Scraping Function
 *
 * @param dir
 * @returns {*}
 */
var landingPage = function (dir) {
    return Rq('https://'+getDirectory(dir).url)
        .then(function (data) {
            if (data) {
                var $ = cheerio.load(data),
                    cn_europe = $('#location_europe .list-countries li'),
                    cn_asia = $('#content-location_asia_pacific li'),
                    cn_north_america = $('#content-location_north_america li');

                // Get Europe Company List
                var europe = [];

                for (var i = 0; i < cn_europe.length; i++) {
                    var country_name = $(cn_europe[i]).find('a').html().split('(')[0].trim(),
                        esomar_url = 'https://' + getDirectory(dir).url + '/' + $(cn_europe[i]).find('a').attr('href');
                    europe.push({country_name: country_name, esomar_url: esomar_url});
                }

                //console.log(europe.length !== undefined ? "yooo" : "noo");
                return europe;
            }
        })
};

var scraper = {
    extract: function (dir) {
        return landingPage(dir)
            .then(function (countries) {
                return navigateAndFetchPages(countries);
            })
            .catch();
    }
}

module.exports = scraper;