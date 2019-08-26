var Rp = require('request'),
    cheerio = require('cheerio'),
    storeToDb = require('../misc_workers/store_companies');

function extractCompanyDetails(pages) {
    var company_details = [],
        counter = pages.length;

    pages.forEach(function (page) {
        Rp(page, function (err, res, body) {
            if (body) {
                var $ = cheerio.load(body);
                var name = $('.details-top').find('h1').text();
                var input = $($('#companycontactstable2 tr').children()[2]).text();
                // console.log(input);
                var url = input.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm);

                if (url && url.length) {
                    company_details.push({
                        country: 'Bluebook',
                        directory: 'Bluebook',
                        company_name: name,
                        company_url: url[0]
                    });

                    console.log(name, url);
                }

                --counter;
                if (!counter) storeToDb(company_details, function () {
                    console.log("Done Storing");
                });
            }
        });
    });
}

module.exports = extractCompanyDetails;
