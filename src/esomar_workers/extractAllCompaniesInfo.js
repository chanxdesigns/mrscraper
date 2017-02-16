var Rp = require('request'),
    cheerio = require('cheerio'),
    extractAndStoreCompanies = require('./extractAndStoreCompanies');

function extractAllCompanies (countries_companies_pages) {
    var pagesArr = [];

    countries_companies_pages.forEach(function (pages) {
        pages.forEach(function (page) {
            pagesArr.push(page);
        })
    });

    console.log(pagesArr);
    console.log(pagesArr.length + "Total")

    var companies_det_arr = [],
        counter = pagesArr.length;
    pagesArr.forEach(function (page) {
        Rp(page, function (err, res, body) {
            if (body) {
                var $ = cheerio.load(body),
                    companies_det = $('h2.mb0');
                companies_det_arr.push(companies_det);
                --counter;
                console.log(counter);
                if (!counter) extractAndStoreCompanies(companies_det_arr);
            }
        });
            // .then(function (body) {
            //     var $ = cheerio.load(body),
            //         companies_det = $('h2.mb0');
            //     companies_det_arr.push(companies_det);
            //     --counter;
            //     console.log(counter);
            //     if (!counter) extractAndStoreCompanies(companies_det_arr);
            // })
            // .catch(function (err) {
            //     return err.message
            // })
    })
}

module.exports = extractAllCompanies;