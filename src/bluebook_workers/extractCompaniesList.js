var Rp = require('request'),
    cheerio = require('cheerio'),
    extractCompanyDetails = require('./extractCompanyDetails');

function extractCompaniesList(directory) {
    var pages = [],
        counter = directory.data.url.length;

    directory.data.url.forEach(function (url) {
        Rp(url, function (err, res, body) {
            if (body) {
                var $ = cheerio.load(body);
                resultsArr = $('.search-list #resultsDet');
                for (var i = 0; i < resultsArr.length; i++) {
                    var compList = $(resultsArr[i]).find('#listInfo span'),
                    bb_url = $(compList).find('a').attr('href');
                    pages.push('https://bluebook.insightsassociation.org' + bb_url);
                }

                --counter;
                if (!counter) {
                    // console.log(pages);
                    extractCompanyDetails(pages);
                }
            }
        })
    })
}

module.exports = extractCompaniesList;
