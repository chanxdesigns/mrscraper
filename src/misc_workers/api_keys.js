var DB = require('./dbconn'),
    mongoose = require('mongoose');

function insert (api_keys, callback) {
    if (!api_keys) {
        callback("No API Keys Stated");
    }

    var keys = api_keys.split(',');
    var Api = mongoose.model('ApiKeys', DB.apiKeySchema);

    var counter = keys.length;
    keys.forEach(function (apikey) {
        Api.findOneAndUpdate({key: apikey},
            {
                key: apikey.trim(),
                usage: true
            },
            {
                new: true,
                upsert: true
            },
            function (err) {
                if (err) throw err;
                --counter;
                if (!counter) callback('API Keys Inserted');
            })
    })
}

module.exports = {insert: insert};