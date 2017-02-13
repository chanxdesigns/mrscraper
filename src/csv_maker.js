var json2csv = require('json2csv'),
    DB = require('./dbconn'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    AWS = require('aws-sdk');

/**
 * Generate CSV file
 *
 * @param callback
 * @param dir
 */
function generate (dir, callback) {
    var db;
    switch(dir) {
        case "esomar":
            db = 'CompaniesEmail';
            break;
        case "bluebook":
            db = 'BlueBookMail';
            break;
    }
    var EmailCollection = mongoose.model(db, DB.companyEmailSchema);
    var emails = EmailCollection.find({});
    emails.exec(function (err, obj) {
        if (err) console.log(err);
        else {
            var fields = ['directory', 'company_name', 'company_url', 'country', 'emails'];
            var csv = json2csv({data: obj, fields: fields, unwindPath: 'emails'});

            var date = Date.now();
            fs.writeFile('files/emails_'+ date +'.csv', csv, function(err) {
                if (err) throw err;
                var clientOptions = {
                    accessKeyId: "AKIAJFBO2N5FZEARJXYA",
                    secretAccessKey: "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",
                    region: 'ap-south-1'
                };
                var s3 = new AWS.S3(clientOptions);

                var params = {
                    Bucket: 'mrscraper',
                    Key: 'files/emails_'+ date +'.csv',
                    Body: fs.readFileSync('files/emails_'+ date +'.csv'),
                    ACL: 'public-read'
                };

                // Upload file to S3
                s3.putObject(params, function (err) {
                    if (err) throw err;
                    fs.unlink('files/emails_'+ date +'.csv');
                    callback('https://s3.ap-south-1.amazonaws.com/mrscraper/files/emails_'+ date +'.csv');
                });
            });
        }
    })
}

module.exports = generate;