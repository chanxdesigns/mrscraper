var Rp = require('request'),
    Mailer = require('../misc_workers/mailer'),
    Mongoose = require('mongoose'),
    DB = require('../misc_workers/dbconn'),
    Queue = require('bull'),
    Promise = require('bluebird'),
    Events = require('events'),
    EventsEmitter = new Events.EventEmitter();

/**
 * Async Mongoose using Bluebird
 */
Mongoose.Promise = require('bluebird');

/**
 * Event Listeners
 */
EventsEmitter.on('complete', function () {
    workers.extractWorker.count().then(function (val) {
        if (!val) {
            console.log("All executed");
        }
    });
})

/**
 * Workers
 *
 */
var workers = {
    extractWorker: Queue('Extract', 6379, '127.0.0.1')
}

workers.extractWorker.process(workerCb);

function workerCb (job, done) {
        "use strict";
        //console.log(job);
}

// var extract_tracker = function () {
//     setInterval(function () {
//         workers.extractWorker.count().then(function (val) {
//             console.log(val);
//             if (!val) {
//                 console.log("All executed");
//                 clearInterval(extract_tracker);
//             } else {
//                 extract_tracker();
//             }
//         });
//     }, 1000);
// }
/**
 * Get Api
 * @returns {Promise.<TResult>}
 */

function getApi () {
    "use strict";
    let Api = Mongoose.model('ApiKeys', DB.apiKeySchema);
    return Api.findOne({usage: true}).exec()
        .then(function (data) {
            return data;
        });
}

function getEmails(companies) {
    getApi().then(function (api) {
        companies.forEach(function (company) {

        })
    })
}

function reloadApi () {
    "use strict";
    getEmails();
}

function paginate(company, api, offset) {
    var query = 'https://api.hunter.io/v2/domain-search?domain=http://' + company.company_url + '&api_key=' + api.key + '&offset=' + offset;
    Rp(query, function (err, res, data) {
        if (data) {
            let mailObj = JSON.parse(data);
            if (mailObj.errors) {
                //
            }
        }
    })
}

module.exports = getEmails;