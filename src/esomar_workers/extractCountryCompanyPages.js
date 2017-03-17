var Rp = require('request'),
    cheerio = require('cheerio'),
    extractAllCompaniesInfo = require('./extractAllCompaniesInfo');

function extractCountryCompanyPages(countriesEsomarUrl) {
    var counter = countriesEsomarUrl.length,
        country_company_pages = [];

    //console.log(countriesEsomarUrl.esomar_url);

    countriesEsomarUrl.forEach(function (countryEsomarUrl) {
        console.log(countryEsomarUrl.esomar_url);
        Rp({url: countryEsomarUrl.esomar_url, timeout: 300000}, function (err, res, body) {
            if (err) console.log(err);
            console.log(body);
            // if (body) {
            //     var $ = cheerio.load(body),
            //         pages_elem = $('.mt0.mb0-5.pt0').find('a').not('.active').splice(0);
            //
            //     //var country_company_pages = [];
            //     pages_elem.forEach(function (page_elem) {
            //         country_company_pages.push({
            //             country: countryEsomarUrl.country_name,
            //             page: $(page_elem).attr('href')
            //         });
            //     });
            //     --counter;
            //     //console.log('Fetching Country Companies Pagination: ' + counter, country_company_pages);
            //     //if (!counter) extractAllCompaniesInfo(country_company_pages);
            // }
        })
    })
}

module.exports = extractCountryCompanyPages;