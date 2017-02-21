var Rp = require('request'),
    Mailer = require('../misc_workers/mailer'),
    Mongoose = require('mongoose'),
    DB = require('../misc_workers/dbconn'),
    fs = require('fs');

Mongoose.Promise = require('bluebird');

function getApi () {
    "use strict";
    let Api = Mongoose.model('ApiKeys', DB.apiKeySchema);
    return Api.find({usage: true}).exec()
        .then(function (data) {
            return data;
        });
}

function getEmails(companies) {
    getApi().then(function (apis) {
        apis.forEach(function (api) {
            "use strict";
            if (api.usage) {
                console.log(api.key);
            }
        });
    })
}

module.exports = getEmails;