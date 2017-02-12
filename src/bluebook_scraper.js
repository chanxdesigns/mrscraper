var request = require('request'),
    cheerio = require('cheerio');

var bluebook = {
    name: "Bluebook",
    host: "https://bluebook.insightsassociation.org/",
    mainPath: "marketing_research_firms_and_services.cfm"
};

function extractEmail(callback) {
    request(bluebook.host + bluebook.mainPath, function (err, res, body) {
        if (body !== undefined) {
            var $ = cheerio.load(body),
                raw = $('.search-total select option'),
                pagesArr = raw.splice(0, (raw.length / 2));

            pagesArr.forEach(function (page) {
                var url = $(page).val();
                request(bluebook.host + url, function (err, res, body) {
                    if (body !== undefined) {
                        var $ = cheerio.load(body),
                            resultsArr = $('.search-list #resultsDet').splice(0);

                        resultsArr.forEach(function (result) {
                            var compList = $(result).find('#listInfo span'),
                                bb_url = $(compList).find('a').attr('href');

                            //console.log(bluebook.host+(bb_url.trim().slice(1)));
                            var counter = 0;
                            request(bluebook.host + (bb_url.trim().slice(1)), function (err, res, body) {
                                if (body !== undefined) {
                                    var $ = cheerio.load(body),
                                        compName = $('.details-top').find('h1').text(),
                                        compDetails = $('#companycontactstable2 tr').first().html(),
                                        emails = compDetails.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);

                                    if (emails) {
                                        emails.forEach(function (email) {
                                            console.log(email);
                                        })
                                    }
                                }
                            })
                        })
                    }
                })
            })
        }
    });
}

module.exports = {extract: extractEmail};
