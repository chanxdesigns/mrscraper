var Rp = require('request-promise'),
    cheerio = require('cheerio'),
    extractAndStoreCompanies = require('./extractAndStoreCompanies');

function extractAllCompanies (countries_companies_pages) {
    var pagesArr = [];

    countries_companies_pages.forEach(function (pages) {
        pages.forEach(function (page) {
            pagesArr.push(page);
        })
    });

    //var companies_det_arr = [],
        //counter = pagesArr.length;
    return pagesArr.map(function (page) {
        return Rp(page)
            .then(function (body) {
                console.log("Yeah")
                if (body) {
                    var $ = cheerio.load(body),
                        companies_det = $('h2.mb0');
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
}

module.exports = extractAllCompanies;