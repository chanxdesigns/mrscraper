var Rp = require('request'),
    Mailer = require('./mailer'),
    Mongoose = require('mongoose'),
    DB = require('./dbconn'),
    Queue = require('bull');

/**
 * Store Email
 *
 * @param companies {Array}
 */
function storeEmail (companies) {
    var query,
        Api = Mongoose.model('ApiKeys', DB.apiKeySchema),
        EmailCollection = Mongoose.model('CompaniesEmails', DB.companyEmailSchema),
        counter = companies.length;

    companies.forEach(function (company) {
        function getKey () {
            Api.findOne({'usage': true})
                .exec(function (err, apikey) {
                    if (err) console.log(err.message);
                    query = 'https://api.hunter.io/v2/domain-search?domain=' + company.company_url + '&api_key=' + apikey.key;
                    Rp(query, function (err, res, body) {
                        if (err) console.log(err.message + "Here it is");
                        if (body) {
                            console.log(body);
                            var hunterObj = JSON.parse(body);
                            if (hunterObj.errors) {
                                Api.findOneAndUpdate(
                                    {key: apikey.key},
                                    {usage: false},
                                    function (err) {
                                        if (err) console.log(err.message);
                                        console.log('Api Key Updated');
                                        getKey();
                                    }
                                );
                            } else {
                                if (hunterObj.data.emails.length) {
                                    var offset = 0;
                                    function paginate() {
                                        if (hunterObj.meta.results > 10) {
                                            var url = offset >= 10 ? query+'&offset='+offset : query;
                                        } else {
                                            url = query;
                                        }
                                        Rp(url, function (err, res, body) {
                                            if (err) console.log(err.message);
                                            if (body) {
                                                var paginate_value = JSON.parse(body);
                                                EmailCollection.findOneAndUpdate(
                                                    {company_url: company.company_url},
                                                    {
                                                        country: company.country,
                                                        directory: company.directory,
                                                        company_name: company.company_name,
                                                        $addToSet: {
                                                            emails: {
                                                                $each: paginate_value.data.emails.map(function (email) {
                                                                    if (email.confidence > 40) return email.value;
                                                                })
                                                            },
                                                            names: {
                                                                $each: paginate_value.data.emails.map(function (email) {
                                                                    if (email.confidence > 40) return email.last_name ? email.first_name + ' ' + email.last_name : email.first_name;
                                                                })
                                                            }
                                                        }
                                                    },
                                                    {new: true, upsert: true},
                                                    function (err) {
                                                        if (err) console.log(err.message);
                                                        else {
                                                            offset += 10;
                                                            if (offset >= hunterObj.meta.results) --counter;
                                                            if (!counter) Mailer.send(company.directory + ': Email Extraction Complete', 'Email extraction complete. You may now download by clicking here https://mrscraper.herokuapp.com/'+company.directory.toLowerCase()+'/download','info@c-research.in');
                                                            if (hunterObj.meta.results > 10 && offset < hunterObj.meta.results) paginate();
                                                        }
                                                    }
                                                );
                                            }
                                        })
                                    }
                                    paginate();
                                } else {
                                    --counter;
                                    if (!counter) Mailer.send(company.directory + ': Email Extraction Complete', 'Email extraction complete. You may now download by clicking here https://mrscraper.herokuapp.com/'+company.directory.toLowerCase()+'/download','info@c-research.in');
                                }
                            }
                        }
                    })
                })
        }
        // Run the main function to query email
        getKey();
    });
}

/**
 * Extract Email
 *
 * @param dir {string}
 */
function extractEmail (dir) {
    if (!dir) throw Error('No Directory Specified');
    EmailExtractorWorker = Queue('Email Extractor', process.env.REDIS_URL);

    EmailExtractorWorker.process(function (dir) {

        var capitalizing = dir.data.split('');
        capitalizing.splice(0, 1, capitalizing[0].toUpperCase());
        var directory = capitalizing.join('');

        Mongoose.model('companies', DB.companySchema)
            .find({directory: directory})
            .exec(function (err, companies) {
                if (err) console.log(err.message);
                storeEmail(companies);
            })

    });

    EmailExtractorWorker.add(dir);
}

module.exports = extractEmail;

