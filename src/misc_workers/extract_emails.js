var Mongoose = require('mongoose'),
    DB = require('./dbconn'),
    Queue = require('bull'),
    email = require('../email_extract_workers/extractAndStoreEmails');

/**
 * Extract Email
 *
 * @param dir {string}
 */
function extractEmail (dir) {
    if (!dir) throw Error('No Directory Specified');
    EmailExtractorWorker = Queue('Email Extractor', process.env.REDIS_URL)//process.env.REDIS_URL);

    EmailExtractorWorker.process(function (dir) {

        var capitalizing = dir.data.split('');
        capitalizing.splice(0, 1, capitalizing[0].toUpperCase());
        var directory = capitalizing.join('');

        Mongoose.model('companies', DB.companySchema)
            .find({directory: directory})
            .exec(function (err, companies) {
                if (err) console.log(err.message);
                email(companies);
            })

    });

    EmailExtractorWorker.add(dir);
}

module.exports = extractEmail;

