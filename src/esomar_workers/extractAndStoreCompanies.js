var Rp = require('request-promise'),
    cheerio = require('cheerio');

function extractAndStoreCompanies (companies_elem) {
    var companies_elem_arr = [];
    companies_elem.forEach(function (company_elems) {
        company_elems.forEach(function (company_elem) {
            companies_elem_arr.push(company_elem);
        })
    });

    console.log(companies_elem_arr.length);

    return companies_elem_arr.map(function (company_elem) {
        var $ = cheerio.load(company_elem);
        var company_esomar_url = $(company_elem).find('a').attr('href');
        return company_esomar_url;
    })
}

module.exports = extractAndStoreCompanies;