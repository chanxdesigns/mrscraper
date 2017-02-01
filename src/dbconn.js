var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DB = {
    companySchema: new mongoose.Schema({
        country: String,
        company_name: String,
        company_url: String,
        created_time: {type: Date, default: Date.now}
    }),

    makeDbConn: function () {
        var uri = "mongodb://127.0.0.1:27017";

        mongoose.connect(uri, function (err, res) {
            if (err) {
                console.log('There is an error: '+err);
            }
            else {
                console.log('Successfully connected to '+uri);
            }
        })
    }
};

module.exports = DB;