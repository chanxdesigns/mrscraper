var Rp = require('request-promise'),
    cheerio = require('cheerio');

function extractAndStoreCompanies (companies_elem) {
    return companies_elem.map(function (company_elem) {
        var $ = cheerio.load(company_elem);
        var company_esomar_url = $(company_elem).find('a').attr('href');
        return company_esomar_url;
    })
}

module.exports = extractAndStoreCompanies;