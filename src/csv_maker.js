var json2csv = require('json2csv'),
    DB = require('./dbconn'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    s3 = require('s3');

function generate (callback) {
    var EmailCollection = mongoose.model('CompaniesEmail', DB.companyEmailSchema);
    var emails = EmailCollection.find({});
    emails.exec(function (err, obj) {
        if (err) console.log(err);
        else {
            var fields = ['directory', 'company_name', 'company_url', 'country', 'emails'];
            var csv = json2csv({data: obj, fields: fields, unwindPath: 'emails'});

            var date = Date.now();
            fs.writeFile('files/emails_'+ date +'.csv', csv, function(err) {
                if (err) throw err;
                console.log('File saved Locally');
                var client = s3.createClient({
                    s3Options: {
                        accessKeyId: "AKIAJFBO2N5FZEARJXYA",
                        secretAccessKey: "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",
                        region: 'ap-south-1'
                    }
                });
                var params = {
                    localFile: 'files/emails_'+ date +'.csv',

                    s3Params: {
                        Bucket: "mrscraper",
                        Key: 'files/emails_'+ date +'.csv',
                        ACL: 'public-read'
                    }
                };
                var uploader = client.uploadFile(params);
                uploader.on('error', function(err) {
                    console.error("unable to upload:", err.stack);
                });
                uploader.on('progress', function() {
                    console.log("progress", uploader.progressMd5Amount,
                        uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on('end', function(data) {
                    console.log(data, "Done uploading");
                });
                //callback('files/emails_'+ date +'.csv', 'emails_'+ date +'.csv');
            });
        }
    })
}

module.exports = generate;