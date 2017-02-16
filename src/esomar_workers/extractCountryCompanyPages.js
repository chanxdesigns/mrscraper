var Rp = require('request-promise'),
    cheerio = require('cheerio');

function extractCountryCompanyPages(countriesEsomarUrl) {
    return countriesEsomarUrl.map(function (countryEsomarUrl) {
        return Rp(countryEsomarUrl.esomar_url)
            .then(function (body) {
                if (body) {
                    var $ = cheerio.load(body),
                        pages_elem = $('.mt0.mb0-5.pt0').find('a').not('.active').splice(0);

                    var country_company_pages = [];
                    pages_elem.forEach(function (page_elem) {
                        country_company_pages.push($(page_elem).attr('href'));
                    });

                    return country_company_pages;
                }
            })
    })
}

module.exports = extractCountryCompanyPages;