const json2csv = require('json2csv'),
    DB = require('./dbconn'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    AWS = require('aws-sdk');

module.exports = function generateEmailsCsv (dir, callback) {
    const Companies = mongoose.model('CompaniesEmails', DB.companyEmailSchema);
    Companies.find({directory: dir[0].toUpperCase() + dir.substr(1)})
        .exec((err, data) => {
            if (err) console.error(err.message);
            if (!data) callback('No emails found for the specified directory.');
            const fields = ['directory', 'country', 'company_name', 'company_url', 'emails'],
                csv = json2csv({data: data, fields: fields, unwindPath: 'emails'});

            var date = Date.now();
            fs.writeFile('files/'+dir+'_emails_'+ date +'.csv', csv, function(err) {
                if (err) throw err;
                var clientOptions = {
                    accessKeyId: "AKIAJFBO2N5FZEARJXYA",
                    secretAccessKey: "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",
                    region: 'ap-south-1'
                };
                var s3 = new AWS.S3(clientOptions);

                var params = {
                    Bucket: 'mrscraper',
                    Key: 'files/'+dir+'_emails_'+ date +'.csv',
                    Body: fs.readFileSync('files/'+dir+'_emails_'+ date +'.csv'),
                    ACL: 'public-read'
                };

                // Upload file to S3
                s3.putObject(params, function (err) {
                    if (err) throw err;
                    fs.unlink('files/'+dir+'_emails_'+ date +'.csv');
                    callback('https://s3.ap-south-1.amazonaws.com/mrscraper/files/'+dir+'_emails_'+ date +'.csv');
                });
            });
        })
}