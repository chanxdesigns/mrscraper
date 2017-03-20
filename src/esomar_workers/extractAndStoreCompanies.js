var Rp = require('request-promise'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose');
    //Bb = require('bluebird');
    //DB = require('../misc_workers/dbconn')

function extractAndStoreCompanies (companies_elem) {
    return companies_elem.map(function (company_elem) {
        if (company_elem) {
            var options = {
                method: "POST",
                uri: "http://dashboard.i-apaconline.com/getsite",
                form: {
                    url: company_elem.company_esomar_url
                }
            };

            return Rp(options)
                .then(body => {
                    if (body) {
                        var $ = cheerio.load(body);
                        return $('a[data-ga-category="website"]').attr('href');
                    }
                })
                .catch(err => {
                    return err.message;
                })

                // .then(function (compUrl) {
                //
                //     var Companies = mongoose.model('Companies', DB.companySchema);
                //     var c_promises = Companies.findOne({company_url: compUrl, company_name: company_elem.company_name}).exec();
                //
                //     return c_promises
                //         .then(function (data) {
                //             if (!data) {
                //                 var Email = new Companies({
                //                     country: company_elem.country,
                //                     directory: 'Esomar',
                //                     company_name: $('h1.uppercase.mb0').text().trim(),
                //                     company_url: compUrl
                //                 });
                //
                //                 new Bb(function(resolve, reject) {
                //                     "use strict";
                //                     Email.save(function (err, res) {
                //                         if (err) return reject(err.message);
                //                         return resolve(res);
                //                     });
                //                 });
                //             }
                //         })
                //         .catch(function (err) {
                //             return err.message;
                //         });
                // })
        }
    })
}

module.exports = extractAndStoreCompanies;