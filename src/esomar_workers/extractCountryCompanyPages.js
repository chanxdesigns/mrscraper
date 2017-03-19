const cheerio = require('cheerio'),
      extractAllCompaniesInfo = require('./extractAllCompaniesInfo'),
      Rp = require('request');

//require('longjohn');

function extractCountryCompanyPages(countriesEsomarUrl) {
    var counter = countriesEsomarUrl.length,
        country_company_pages = [];

    countriesEsomarUrl.forEach(function (countryEsomarUrl) {
        Rp({url: 'http://dashboard.i-apaconline.com/getsite', form: {url: countryEsomarUrl.esomar_url}}, function (err, res, body) {
            console.log(body);
            if (err) console.log(err);
            if (body) {
                var $ = cheerio.load(body),
                    pages_elem = $('.mt0.mb0-5.pt0').find('a').not('.active').splice(0);

                pages_elem.forEach(function (page_elem) {
                    country_company_pages.push({
                        country: countryEsomarUrl.country_name,
                        page: $(page_elem).attr('href')
                    });
                });
                --counter;
                //console.log('Fetching Country Companies Pagination: ' + counter, country_company_pages);
                if (!counter) extractAllCompaniesInfo(country_company_pages);
            }
        })
    })
}

module.exports = extractCountryCompanyPages;