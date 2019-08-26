var request = require('request'),
    Rp = require('request-promise'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    DB = require('./misc_workers/dbconn'),
    Queue = require('bull'),
    extractCompaniesList = require('./bluebook_workers/extractCompaniesList');

var bluebook = {
    name: "Bluebook",
    host: "https://bluebook.insightsassociation.org/",
    mainPath: "marketing_research_firms_and_services.cfm"
};

function extractPages() {
    return Rp(bluebook.host + bluebook.mainPath)
        .then(function (body) {
            if (body !== undefined) {
                var $ = cheerio.load(body),
                    bbWorker = Queue('Bluebook Extract', process.env.REDIS_URL || 'redis://127.0.0.1:6379'),
                    pageCount = $('.search-total select option').length / 2,
                    links = [];

                for (var i = 1; i <= pageCount; i++) {
                    links.push(bluebook.host + bluebook.mainPath + '?PageNum_results=' + i)
                }

                bbWorker.process(function (directory) {
                    extractCompaniesList(directory);
                });

                bbWorker.add({url: links});
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}

// function extractMail(pagesArr) {
//     var BluebookMail = mongoose.model('BlueBookMail', DB.companyEmailSchema);
//     return pagesArr.map(function (page) {
//         var $ = cheerio.load(page);
//         var url = $(page).val();
//         return Rp(bluebook.host + url)
//             .then(function (body) {
//                 if (body !== undefined) {
//                     var $ = cheerio.load(body),
//                         resultsArr = $('.search-list #resultsDet').splice(0);
//
//                     return resultsArr.map(function (result) {
//                         var compList = $(result).find('#listInfo span'),
//                             bb_url = $(compList).find('a').attr('href');
//
//                         return Rp(bluebook.host + (bb_url.trim().slice(1)))
//                             .then(function (body) {
//                                 if (body !== undefined) {
//                                     var $ = cheerio.load(body),
//                                         compName = $('.details-top').find('h1').text(),
//                                         compDetails = $('#companycontactstable2 tr').first().html(),
//                                         emails = compDetails.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
//
//                                     if (emails) {
//                                         BluebookMail.findOneAndUpdate(
//                                             {
//                                                 directory: "Bluebook",
//                                                 company_url: 'www.'+emails[0].split('@')[1]
//                                             },
//                                             {
//                                                 company_name: compName,
//                                                 emails: emails.reduce(function (result, email) {
//                                                     if (result.indexOf(email) < 0) {
//                                                         result.push(email);
//                                                     }
//                                                     return result;
//                                                 },[])
//                                             },
//                                             {
//                                                 upsert: true,
//                                                 new: true
//                                             },
//                                             function (err, res) {
//                                                 if (err) throw err;
//                                                 console.log(res);
//                                             }
//                                         )
//                                     }
//                                 }
//                             })
//                     })
//                 }
//             })
//     });
// }

module.exports = {companies: extractPages};
