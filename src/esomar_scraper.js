var mongoose = require('mongoose'),
    request = require('request'),
    //Rp = require('request-promise'),
    //cheerio = require('cheerio'),
    DB = require('./dbconn'),
    extractCountryDirPages = require('./esomar_workers/extractCountryDirPages'),
    extractCountryCompanyPages = require('./esomar_workers/extractCountryCompanyPages'),
    extractAllCompaniesInfo = require('./esomar_workers/extractAllCompaniesInfo'),
    extractAndStoreCompanies = require('./esomar_workers/extractAndStoreCompanies'),
    storeToDb = require('./esomar_workers/storeToDb');
//mail = require('./mailer');

var Queue = require('bull');

var directory = {dir: "esomar", dirname: "Esomar", url: "directory.esomar.org"};

var esomarWorker = Queue('Esomar Extract', 'redis://h:pffc3ab707f46c10f7b417658a3503dd4e85a823dafc6ccffa3c2dcf69f1a7e0d@ec2-34-198-196-38.compute-1.amazonaws.com:30179');

esomarWorker.process(function (dir) {
    extractCountryDirPages(dir.data)
        .then(function (countriesEsomarUrl) {
            return Promise.all(extractCountryCompanyPages(countriesEsomarUrl));
        })
        .then(function (country_company_pages) {
            return Promise.all(extractAllCompaniesInfo(country_company_pages));
        })
        .then (function (companiesElem) {
            return Promise.all(extractAndStoreCompanies(companiesElem));
        })
        .then(function () {
            console.log('done');
        })
        .catch(function (err) {
            console.log(err.message);
        })
});

function extractCompanies() {
    esomarWorker.add(directory)
}


/**
 * Get Individual Directory
 *
 * @param directoryName
 * @returns {*}
 */
// function getDirectory (directoryName) {
//     try {
//         // If directory not specified by the user
//         if (directoryName === undefined) throw 404;
//
//         // Directory availability counter
//         var counter = 0;
//         // Loop through the preset company directories folder
//         for (var i = 0; i < directories.length; i++) {
//             if (directories[i].dir === directoryName) {
//                 counter++;
//                 return directories[i];
//             }
//         }
//
//         // If counter not increased from 0
//         // then directory doesn't exists
//         if (!counter) throw 404;
//     }
//     catch (err) {
//         return err;
//     }
// }

/**
 * Extract Emails
 *
 * @param response
 * @param callback
 */
// function extractEmail (response, callback) {
//     var Companies = mongoose.model('Companies', DB.companySchema),
//         EmailCollection = mongoose.model('CompaniesEmail', DB.companyEmailSchema),
//         Api = mongoose.model('ApiKeys', DB.apiKeySchema),
//         CompaniesQuery = Companies.find({});
//
//     CompaniesQuery.exec(function (err, companies) {
//         var counter = companies.length;
//         companies.forEach(function (company) {
//             var queryUri;
//             function getKey () {
//                 var apikey = Api.findOne({'usage': true});
//                 apikey.exec(function (err, apikey) {
//                     queryUri = 'https://api.hunter.io/v2/domain-search?domain='+ company.company_url +'&api_key='+apikey.key;
//                     request(queryUri, function (err, res, body) {
//                         if (err) throw err;
//                         var hunterObj = JSON.parse(body);
//                         if (hunterObj.errors) {
//                             Api.findOneAndUpdate(
//                                 {
//                                     key: apikey.key
//                                 },
//                                 {
//                                     usage: false
//                                 },
//                                 function (err) {
//                                     if (err) throw err;
//                                     console.log('API KEY UPDATED');
//                                     getKey();
//                                 }
//                             );
//                         }
//                         else {
//                             if (hunterObj.data.emails.length !== 0) {
//                                 var offset = 0;
//                                 function getMoreEmail () {
//                                     if (hunterObj.meta.results > 10) {
//                                         var url = offset >= 10 ? queryUri+'&offset='+offset : queryUri;
//                                     }
//                                     else {
//                                         url = queryUri;
//                                     }
//                                     request(url, function (err, res, body) {
//                                         if (err) console.log(err);
//                                         var moreMail = JSON.parse(body);
//                                         EmailCollection.findOneAndUpdate(
//                                             {
//                                                 company_url: company.company_url
//                                             },
//                                             {
//                                                 country: company.country,
//                                                 company_name: company.company_name,
//                                                 directory: company.directory,
//                                                 $addToSet: {
//                                                     emails: {
//                                                         $each: moreMail.data.emails.map(function (email) {
//                                                             if (email.confidence > 40) return email.value;
//                                                         })
//                                                     },
//                                                     names: {
//                                                         $each: moreMail.data.emails.map(function (email) {
//                                                             if (email.confidence > 40) return email.last_name ? email.first_name + ' ' + email.last_name : email.first_name;
//                                                         })
//                                                     }
//                                                 }
//                                             },
//                                             {
//                                                 new: true,
//                                                 upsert: true
//                                             }, function (err) {
//                                                 if (err) console.log(err);
//                                                 else {
//                                                     offset += 10;
//                                                     //if (offset >= hunterObj.meta.results) ;
//                                                     if (hunterObj.meta.results > 10 && offset < hunterObj.meta.results) getMoreEmail();
//                                                 }
//                                             });
//                                     });
//                                 }
//                                 getMoreEmail();
//                                 --counter;
//                                 if (!counter) {
//                                     mail.send('Email Extraction Completed', 'This is to notify you that your e-mail extraction is completed. You may now download the csv file. To download visit http://'+response.hostname+'/download','chanx.singha@c-research.in');
//                                     callback('Extraction Completed!');
//                                 }
//                             }
//                             else {
//                                 --counter;
//                                 if (!counter) {
//                                     mail.send('Email Extraction Completed', 'This is to notify you that your e-mail extraction is completed. You may now download the csv file. To download visit http://'+response.hostname+'/download','chanx.singha@c-research.in');
//                                     callback('Extraction Completed!');
//                                 }
//                             }
//                         }
//                     });
//                 });
//             }
//             getKey();
//         });
//     })
// }

/**
 * Get Companies
 * Allows you to download Companies as CSV file
 *
 * @param callback
 */
function getCompanies(callback) {
    var Companies = mongoose.model('Companies', DB.companySchema);
    var query = Companies.find({});
    query.exec(function (err, companies) {
        if (err) {
            return "Somethings wrong while retrieving " + err;
        }
        callback(companies);
    })
}

/**
 * Initiate Database Connection
 */
DB.makeDbConn();

var scraper = {
    // extract: function (res, callback) {
    //     extractCompanies(res, function (data) {
    //         callback(data);
    //     })
    // },
    //extractCountryDirPages: extractCountryDirPages,
    //extractCountryCompanyPages: extractCountryCompanyPages,
    getCompanies: getCompanies,
    extractCompanies: extractCompanies
    //extractEmail: extractEmail
};

module.exports = scraper;