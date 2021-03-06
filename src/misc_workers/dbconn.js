var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DB = {
    /**
     * Model Schemas
     */
    companySchema: new Schema({
        country: String,
        directory: String,
        company_name: String,
        company_url: String,
        created_time: {type: Date, default: Date.now}
    }),

    companyEmailSchema: new Schema({
        country: String,
        directory: String,
        company_name: String,
        company_url: String,
        emails: Array,
        names: Array,
        created_time: {type: Date, default: Date.now}
    }),

    apiKeySchema: new Schema({
        key: String,
        usage: Boolean
    }),

    /**
     * Make Database Connection
     */
    makeDbConn: function () {
        var uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

        mongoose.connect(uri, {
            server: {
                socketOptions: {
                    keepAlive: 300000,
                    connectTimeoutMS: 30000
                }
            },
            replset: {
                socketOptions: {
                    keepAlive: 300000,
                    connectTimeoutMS : 30000
                }
            }
        });

        var conn = mongoose.connection;
        conn.on('error', console.error.bind(console, 'Connection error!'));
    }
};

module.exports = DB;