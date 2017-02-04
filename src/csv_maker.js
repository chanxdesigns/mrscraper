var json2csv = require('json2csv'),
    DB = require('./dbconn'),
    mongoose = require('mongoose'),
    fs = require('fs');

function generate (callback) {
    DB.makeDbConn();

    var EmailCollection = mongoose.model('CompaniesEmail', DB.companyEmailSchema);
    var emails = EmailCollection.find({});
    emails.exec(function (err, obj) {
        if (err) console.log(err);
        else {
            var fields = ['directory', 'company_name', 'company_url', 'country', 'emails'];
            var csv = json2csv({data: obj, fields: fields, unwindPath: 'emails'});

            fs.writeFile('emails.csv', csv, function(err) {
                if (err) throw err;
                console.log('file saved');
            });
        }
    })
}

module.exports = generate;