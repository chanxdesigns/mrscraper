var Rp = require('request'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose');
    //Bb = require('bluebird');
    //DB = require('../misc_workers/dbconn')

function extractAndStoreCompanies (companies_elem) {
    var counter = companies_elem.length,
        all_c_web_elem = [];
    companies_elem.forEach(function (company_elem) {
        if (company_elem) {
            var options = {
                method: "POST",
                uri: "http://dashboard.i-apaconline.com/getsite",
                form: {
                    url: company_elem.company_esomar_url
                }
            };

            Rp(options, (err, res, body) => {
                if (err) console.log(err.message);
                if (body) {
                    var $ = cheerio.load(body);
                    all_c_web_elem.push({
                        name: company_elem.company_name,
                        country: company_elem.country,
                        website: $('a[data-ga-category="website"]').attr('href').trim()
                    });
                }
                --counter;
                if (!counter) {
                    console.log(all_c_web_elem);
                }
            });
        }
    })
}

module.exports = extractAndStoreCompanies;