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
                var name = $('.uppercase.mb0').text();
                var country = $('.onmobile-pr0.onmobile-pt2.onmobile-aligncenter.pb1').find('a').text();
                var url = $('.col.automedium.w20e .col.w13e').find('p a').first().attr('href');

                if (url) {
                    company_details.push({
                        country: country,
                        directory: 'Esomar',
                        company_name: name,
                        company_url: url
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
