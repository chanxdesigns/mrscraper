var Rp = require('request'),
    Mailer = require('../misc_workers/mailer'),
    Mongoose = require('mongoose'),
    DB = require('../misc_workers/dbconn'),
    fs = require('fs');

/**
 * Store Email
 *
 * @param companies {Array}
 */
function getEmail (api_array, companies) {
    "use strict";

    var api_array = api_array;
    api_array.forEach(function (api, index) {
        companies.forEach(function (company) {
            function reloadApi() {
                var uri = 'https://api.hunter.io/v2/domain-search?domain=http://' + company.company_url + '&api_key=' + api.usage ? api.key : false;
                Rp(uri, function (err, res, body) {
                    var mailObj = JSON.parse(body);
                    // If Errors returned i.e for Authentication, API limit reached
                    if (mailObj.errors) {
                        console.log("Yeah Errors is there!");
                        api_array[index].usage = false;
                        reloadApi();
                        return;
                    }
                    // If No Errors extract emails and names directly
                    else {
                        // If Emails exists
                        if (mailObj.data.emails.length) {
                            // Search in the Email collection using the company url
                            // And update it with the latest information
                            // If not found, then insert as new item
                            if (mailObj.meta.results > 10) {
                                paginate(mailObj);
                            }
                        }
                    }
                })
            }

        });
    })

    var EmailCollection = Mongoose.model('CompaniesEmails', DB.companyEmailSchema);
    EmailCollection.findOneAndUpdate(
        {company_url: company.company_url},
        {
            country: company.country,
            directory: company.directory,
            company_name: company.company_name,
            $addToSet: {
                emails: {
                    $each: mailObj.data.emails.map(function (email) {
                        if (email.confidence > 40) return email.value;
                    })
                },
                names: {
                    $each: mailObj.data.emails.map(function (email) {
                        if (email.confidence > 40) return email.first_name+email.last_name;
                    })
                }
            }
        },
        {new: true, upsert: true},
        function (err, res) {
            if (err) console.log(err.message);
            else {
                console.log('Inserted ' +res);
                // offset += 10;
                // if (offset >= hunterObj.meta.results) --counter;
                // if (!counter) Mailer.send(company.directory + ': Email Extraction Complete', 'Email extraction complete. You may now download by clicking here https://mrscraper.herokuapp.com/'+company.directory.toLowerCase()+'/download','info@c-research.in');
                // if (hunterObj.meta.results > 10 && offset < hunterObj.meta.results) paginate();
            }
        }
    );
}

function storeEmail (companies) {
    "use strict";

    var Api = Mongoose.model('ApiKeys', DB.apiKeySchema);

    var api_array = [];
    Api.find({usage: true})
        .exec(function (err, apis) {
            //uri = 'https://api.hunter.io/v2/domain-search?domain=' + company.company_url + '&api_key='+api.key;
            //getEmail(company, uri);
            var counter = apis.length;
            apis.forEach(function (api) {
                api_array.push(api);
                --counter;
                if (!counter) getEmail(api_array, companies);
            })
            return;
        });

    companies.forEach(function (company) {

    });
}

module.exports = storeEmail;