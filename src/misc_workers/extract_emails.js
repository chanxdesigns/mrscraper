var Mongoose = require('mongoose'),
    DB = require('./dbconn'),
    Queue = require('bull'),
    email = require('../email_extract_workers/extractAndStoreEmails'),
    Rp = require('request'),
    Bb = require('bluebird');

/**
 * Async Mongoose using Bluebird
 */
Mongoose.Promise = require('bluebird');

/**
 * Extract Email
 *
 * @param dir {string}
 */
function extractCompanies (dir) {
    if (!dir) throw Error('No Directory Specified');

    var capitalizing = dir.data.split('');
    capitalizing.splice(0, 1, capitalizing[0].toUpperCase());
    var directory = capitalizing.join('');

    return Mongoose.model('companies', DB.companySchema)
        .find({directory: directory}).exec()
        .then(function (err, companies) {
            if (err) console.log(err.message);
            return companies;
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
        ),
            function (err) {
                if (err) return reject;
                return resolve(1);
            }
    })
}
var helpers = {
    offset: 0
}
function getEmails (dir) {
    "use strict";
    getApi().then(function (api) {
            extractCompanies(dir).then(function (companies) {
                companies.forEach(function (company) {
                    let uri = 'https://api.hunter.io/v2/domain-search?domain=' + company.company_url + '&api_key=' + api.key;
                    queryHunter(uri);
                });
            });
    });
}

function queryHunter(uri, api) {
    if (helpers.offset >= 10) uri += '&offset='+helpers.offset;
    Rp(uri, function (err, res, body) {
        if (body) {
            let mailObj = JSON.parse(body);
            if (mailObj.errors) {
                getApi(api.key).then(function (data) {
                    if (data) queryHunter(uri, api);
                })
            } else {
                if (mailObj.data.emails.length) {
                    //
                }
            }
        }
    })
}



module.exports = getEmails;

