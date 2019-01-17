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
            db = 'Companies';
            break;
        case "greenbook":
            db = 'Companies';
            break;
        case "bluebook":
            db = 'BlueBookMail';
            break;
    }
    var Companies = mongoose.model(db, DB.companySchema);
    var comp = Companies.find({directory: dir[0].toUpperCase() + dir.substr(1)});
    comp.exec(function (err, obj) {
        if (err) console.log(err);
        else {
            var fields = ['directory', 'company_name', 'company_url', 'country'];
            var csv = json2csv({data: obj, fields: fields});

            var date = Date.now();
            fs.writeFile('files/companies_'+ date +'.csv', csv, function(err) {
                if (err) throw err;
                var clientOptions = {
                    accessKeyId: "AKIAJY5OAW4EMSPQPTQA",
                    secretAccessKey: "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",
                    region: 'ap-south-1'
                };
                var s3 = new AWS.S3(clientOptions);

                var params = {
                    Bucket: 'mrscraper',
                    Key: 'files/companies_'+ date +'.csv',
                    Body: fs.readFileSync('files/companies_'+ date +'.csv'),
                    ACL: 'public-read'
                };

                // Upload file to S3
                s3.putObject(params, function (err) {
                    if (err) throw err;
                    fs.unlink('files/companies_'+ date +'.csv');
                    callback('https://s3.ap-south-1.amazonaws.com/mrscraper/files/companies_'+ date +'.csv');
                });
            });
        }
    })
}

module.exports = generate;