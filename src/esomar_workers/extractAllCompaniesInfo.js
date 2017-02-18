var Rp = require('request'),
    cheerio = require('cheerio');

function extractAllCompanies (countries_companies_pages) {
    var companies_list = [],
        counter = countries_companies_pages.length;

    countries_companies_pages.forEach(function (page) {
        Rp(page, function (err, res, body) {
            if (body) {
                var $ = cheerio.load(body),
                    companies_det = $('.bg-eso-lightblue h2.mb0');
                companies_list.push(companies_det);
                console.log(companies_list.length);
            }
        })
    });
}

module.exports = extractAllCompanies;