var mongoose = require('mongoose'),
    DB = require('./dbconn'),
    Mailer = require('./mailer');

function storeCompaniesData (datas, cb) {
    if (datas) {
        // Create Companies Model
        var CompaniesCollection = mongoose.model('Companies', DB.companySchema),

        // Counter for tracking loops
        counter = datas.length;

        // Loop through and store data
        datas.forEach(function (data) {
            CompaniesCollection.findOne({'company_url': data.company_url},{'directory': data.directory})
                .exec(function (err, res) {
                    if (!res) {
                        var company = new CompaniesCollection(data);
                        company.save(function (err) {
                            if (err) console.log(err.message);
                            --counter;
                            console.log('Saving Now: '+counter);
                            if (!counter) {
                                Mailer.send(data.directory + ' ' + data.country + ' Companies Storage Complete', 'Company extraction of '+ data.directory+' Directory Complete. You may now complete extracting email by visiting http://mrscraper.heroku.com/greenbook/extract-emails', 'chppal50@gmail.com');
                                cb();
                            }
                        });
                    }
                    else {
                        --counter;
                        if (!counter) {
                            Mailer.send(data.directory + ' ' + data.country + ' Companies Storage Complete', 'Company extraction of '+ data.directory+' Directory Complete. You may now complete extracting email by visiting http://mrscraper.heroku.com/greenbook/extract-emails', 'chppal50@gmail.com');
                            cb();
                        }
                    }
                })
        });
    }
}

module.exports = storeCompaniesData;