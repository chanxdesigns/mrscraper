var Rp = require('request-promise'),
    cheerio = require('cheerio');

function extractAndStoreCompanies (companies_elem) {
    console.log(companies_elem);
    return companies_elem.map(function (company_elem) {
        //
    })
}

module.exports = extractAndStoreCompanies;