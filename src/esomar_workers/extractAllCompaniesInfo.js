var Rp = require('request-promise'),
    cheerio = require('cheerio');

function extractAllCompanies (countries_companies_pages) {
    var pagesArr = [];

    countries_companies_pages.forEach(function (pages) {
        pages.forEach(function (page) {
            pagesArr.push(page);
        })
    });

    var companies_det_arr = [];
    return pagesArr.map(function (page) {
        return Rp(page)
            .then(function (body) {
                if (body) {
                    var $ = cheerio.load(body),
                        companies_det = $('.bg-eso-lightblue h2.mb0');
                    return companies_det;
                    //companies_det_arr.push(companies_det);
                    //--counter;
                    //console.log(counter);
                    //if (!counter) extractAndStoreCompanies(companies_det_arr);
                }
            })
            .catch(function (err) {
                console.log(err.message + " Main ERR")
            })
    });
}

module.exports = extractAllCompanies;