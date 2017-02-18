var Rp = require('request'),
    cheerio = require('cheerio'),
    storeToDb = require('../misc_workers/store_companies');

function extractCompaniesDetails(companies_list) {
    var companies_details = [],
        counter = companies_list.length;

    companies_list.forEach(function (company) {
        Rp(company.company_gb_url, function (err, res, body) {
            if (err) console.log(err.message);
            if (body) {
                var $ = cheerio.load(body),
                    spanUrl = $($('#tab1 .span4 > .desc-list')[1]).find('span.bold').text().trim(),
                    hrefUrl = $($('#tab1 .span4 > .desc-list')[1]).find('a').text().trim(),
                    rawUrl = spanUrl ? spanUrl : hrefUrl;

                if (rawUrl) {
                    var rawUrlArr = rawUrl.split('/'),
                        url = rawUrlArr[0] === 'http:' || rawUrlArr[0] === 'https:' ? rawUrlArr.splice(2).join('/') : rawUrl
                }

                companies_details.push({
                    country: company.country,
                    directory: 'Greenbook',
                    company_name: $('.box-title h2').text().trim(),
                    company_url: url ? url : '404'
                });

                --counter;
                if (!counter) storeToDb(companies_details);
            }
        })
    })
}

module.exports = extractCompaniesDetails;