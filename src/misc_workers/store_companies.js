var mongoose = require('mongoose'),
    DB = require('./dbconn'),
    Mailer = require('./mailer');

function storeCompaniesData (datas) {
    if (datas) {
        // Create Companies Model
        var CompaniesCollection = mongoose.model('Companies', DB.companySchema),

        // Counter for tracking loops
            counter = datas.length;

        // Loop through and store data
        datas.forEach(function (data) {
            var company = new CompaniesCollection(data);
            company.save(function (err) {
                if (err) console.log(err.message);
                --counter;
                console.log('Saving Now: '+counter);
                if (!counter) Mailer.send('Greenbook Extraction Complete', 'Company extraction of Greenbook Directory Complete', 'info@c-research.in');
            })
        })
    }
}

module.exports = storeCompaniesData;