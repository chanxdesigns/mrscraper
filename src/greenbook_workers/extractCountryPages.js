var Rp = require('request'),
    cheerio = require('cheerio'),
    extractCountryCompanies = require('./extractCountryCompanies');

function extractCountryPages(directory) {
    Rp(directory.data.url, function (err, res, body) {
        if (body) {
            var $ = cheerio.load(body),
                countries_page_elem = $('#browse_loc_MRS_CTRY').find('li').splice(0),
                countries_page = [];

            countries_page_elem.forEach(function (country_page) {
                var $ = cheerio.load(country_page),
                    elem = $('a');

                countries_page.push({
                    country: elem.text(),
                    page: directory.data.url + (elem.attr('href').substr(1))
                });
            });

            extractCountryCompanies(countries_page);
        }
    })
}

module.exports = extractCountryPages;