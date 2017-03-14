var Mongoose = require('mongoose'),
    DB = require('./dbconn'),
    Mailer = require('./mailer'),
    Rp = require('request-promise'),
    Bb = require('bluebird');

/**
 * Async Mongoose using Bluebird
 */
Mongoose.Promise = Bb;

/**
 * Extract Email
 *
 * @param dir {string}
 */
function extractCompanies (dir) {
    if (!dir) throw Error('No Directory Specified');

    var capitalizing = dir.split('');
    capitalizing.splice(0, 1, capitalizing[0].toUpperCase());
    var directory = capitalizing.join('');

    let CompanyModel = Mongoose.model('companies',DB.companySchema),
        Companies = CompanyModel.find({directory: directory}).exec();
    
    return Companies
        .then((companies) => {
            return companies;
        })
        .catch((err) => {
            console.log(err.message)
            return err.message;
        })
}

/**
 * Get Api
 * @returns {Promise.<TResult>}
 */

function getApi (key) {
    "use strict";
    let Api = Mongoose.model('ApiKeys', DB.apiKeySchema);
    if (!key) {
        return Api.findOne({usage: true}).exec()
            .then(function (data) {
                return data;
            });
    }
    return new Bb(function (resolve, reject) {
        Api.findOneAndUpdate(
            {'key': key},
            {'usage': false},
            function (err) {
                if (err) return reject;
                return resolve(1);
            }
        )
    })
}

function getEmails (dir, cb) {
    "use strict";
    getApi().then(function (api) {
        extractCompanies(dir).then(function (companies) {
            let counter = companies.length;
            companies.forEach((company) => {
                if (company.company_url != 404) {
                    let uri = 'https://api.hunter.io/v2/domain-search?domain=' + company.company_url + '&api_key=' + api.key;
                    Rp(uri, (err, res, body) => {
                        if (body) {
                            let mailObj = JSON.parse(body);
                            if (mailObj.errors) {
                                getApi(api.key).then(function (data) {
                                    if (data) queryHunter(uri, api);
                                })
                            } else {
                                if (mailObj.data.emails.length) {
                                    mailObj.data.emails;
                                    --counter;
                                    if (!counter) {
                                        Mailer.send('Extraction Completed','Extraction Of Emails and Saving Completed','info@c-research.in');
                                        cb('Extraction Completed');
                                    }
                                }
                                else {
                                    --counter;
                                }
                            }
                        }
                    });
                }
                console.log(company.company_url);
            });
        });
    });
}

function queryHunter(company, api) {

}



module.exports = getEmails;

