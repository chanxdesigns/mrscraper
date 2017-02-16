var Rp = require('request-promise'),
    cheerio = require('cheerio');

function extractAllCompanies (countries_companies_pages) {
    var pagesArr = [];

    countries_companies_pages.forEach(function (pages) {
        pages.forEach(function (page) {
            pagesArr.push(page);
        })
    });

    var companies_det_arr = pagesArr.map(function (page) {
        Rp(page)
            .then(function (body) {
                if (body) {
                    var $ = cheerio.load(body);
                    return {
                        body: $('.bg-eso-lightblue h2.mb0'),
                        status: false
                    };
                }
            })
            .catch(function (err) {
                console.log(err.message + " Main ERR")
            })
    });
    console.log(companies_det_arr.length);
}

module.exports = extractAllCompanies;