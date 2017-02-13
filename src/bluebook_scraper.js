var request = require('request'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    DB = require('./dbconn');

var bluebook = {
    name: "Bluebook",
    host: "https://bluebook.insightsassociation.org/",
    mainPath: "marketing_research_firms_and_services.cfm"
};

function extractEmail(callback) {
    var BluebookMail = mongoose.model('BlueBookMail', DB.companyEmailSchema);
    request(bluebook.host + bluebook.mainPath, function (err, res, body) {
        if (body !== undefined) {
            var $ = cheerio.load(body),
                raw = $('.search-total select option'),
                pagesArr = raw.splice(0, (raw.length / 2));

            var counter = pagesArr.length;
            pagesArr.forEach(function (page) {
                var url = $(page).val();
                request(bluebook.host + url, function (err, res, body) {
                    if (body !== undefined) {
                        var $ = cheerio.load(body),
                            resultsArr = $('.search-list #resultsDet').splice(0);

                        counter += resultsArr.length;
                        resultsArr.forEach(function (result) {
                            var compList = $(result).find('#listInfo span'),
                                bb_url = $(compList).find('a').attr('href');

                            request(bluebook.host + (bb_url.trim().slice(1)), function (err, res, body) {
                                if (body !== undefined) {
                                    var $ = cheerio.load(body),
                                        compName = $('.details-top').find('h1').text(),
                                        compDetails = $('#companycontactstable2 tr').first().html(),
                                        emails = compDetails.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);

                                    if (emails) {
                                        BluebookMail.findOneAndUpdate(
                                            {
                                                directory: "Bluebook",
                                                company_url: 'www.'+emails[0].split('@')[1]
                                            },
                                            {
                                                company_name: compName,
                                                emails: emails.reduce(function (result, email) {
                                                    if (result.indexOf(email) < 0) {
                                                        result.push(email);
                                                    }
                                                    return result;
                                                },[])
                                            },
                                            {
                                                upsert: true,
                                                new: true
                                            },
                                            function (err, res) {
                                                if (err) throw err;
                                                --counter;
                                                console.log(counter);
                                            }
                                        )
                                    }
                                }
                            })
                        })
                    }
                })
            })
            --counter;
            console.log(counter);
        }
    });
}

module.exports = {extract: extractEmail};
