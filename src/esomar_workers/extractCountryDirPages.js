var Rp = require('request'),
    cheerio = require('cheerio'),
    extractCountryCompanyPages = require('./extractCountryCompanyPages');

function extractCountryDirPages (directory) {
    Rp('https://'+directory.url, function (err, res, body) {
        if (body) {
            // Extract Countries Continents
            var $ = cheerio.load(body),
                cn_europe = $('#location_europe .list-countries li').splice(0),
                cn_asia = $('#content-location_asia_pacific li').splice(0),
                cn_north_america = $('#content-location_north_america li').splice(0);

            // Get Country Directory List
            var country_dir = [];

            cn_europe.forEach(function (europe) {
                country_dir.push({
                    country_name: $(europe).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + directory.url + '/' + $(europe).find('a').attr('href')
                });
            });

            cn_asia.forEach(function (asia) {
                country_dir.push({
                    country_name: $(asia).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + directory.url + '/' + $(asia).find('a').attr('href')
                });
            });

            cn_north_america.forEach(function (n_america) {
                country_dir.push({
                    country_name: $(n_america).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + directory.url + '/' + $(n_america).find('a').attr('href')
                });
            });
            // Run Country Company Pages Extraction
            console.log(country_dir);
            extractCountryCompanyPages(country_dir);
        }
    })
}

module.exports = extractCountryDirPages;