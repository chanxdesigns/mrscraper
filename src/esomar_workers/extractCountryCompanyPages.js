var Rp = require('request'),
    cheerio = require('cheerio'),
    extractAllCompaniesInfo = require('./extractAllCompaniesInfo');

function extractCountryCompanyPages(countriesEsomarUrl) {
    var counter = countriesEsomarUrl.length,
        country_company_pages = [];

    console.log(counter, countriesEsomarUrl);

    countriesEsomarUrl.forEach(function (countryEsomarUrl) {
        Rp({url: countryEsomarUrl.esomar_url, timeout: 30000}, function (err, res, body) {
            if (err) console.log(err.message);
            if (body) {
                var $ = cheerio.load(body),
                    pages_elem = $('.mt0.mb0-5.pt0').find('a').not('.active').splice(0);

                //var country_company_pages = [];
                pages_elem.forEach(function (page_elem) {
                    country_company_pages.push($(page_elem).attr('href'));
                });
                --counter;
                console.log(counter)
                if (!counter) extractAllCompaniesInfo(country_company_pages);
            }
        })
    })
}

module.exports = extractCountryCompanyPages;