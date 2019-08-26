var Rp = require('request'),
    cheerio = require('cheerio'),
    extractCompanyDetails = require('./extractCompanyDetails');

function extractCompaniesList(directory) {
    var pages = [],
        counter = directory.data.url.length;

    directory.data.url.forEach(function (url) {
        Rp(url, function (err, res, body) {
            console.error('error:', err);
            if (body) {
                var $ = cheerio.load(body);
                resultsArr = $('.search-list #resultsDet');
                console.log(resultsArr);
                resultsArr.map(function (result) {
                    var compList = $(result).find('#listInfo span'),
                        bb_url = $(compList).find('a').attr('href');

                    pages.push('https://bluebook.insightsassociation.org' + bb_url);
                });

                --counter;
                if (!counter) {
                    extractCompanyDetails(pages);
                }
            }
        })
    })
}

module.exports = extractCompaniesList;
