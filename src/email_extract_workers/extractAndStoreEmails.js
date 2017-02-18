var Rp = require('request'),
    Mailer = require('../misc_workers/mailer'),
    Mongoose = require('mongoose'),
    DB = require('../misc_workers/dbconn'),
    fs = require('fs');

/**
 * Store Email
 *
 * @param companies {Array}
 */
function storeEmail (companies) {
    var query,
        Api = Mongoose.model('ApiKeys', DB.apiKeySchema),
        EmailCollection = Mongoose.model('CompaniesEmails', DB.companyEmailSchema),
        counter = 5;

    companies.forEach(function (company) {
        //q = 'https://api.hunter.io/v2/domain-search?domain=' + company.company_url + '&api_key=0f581e8afbe161491bfa5a7e88d7394c05039b52';
        Rp('http://google.in', function (err, res, body) {
            var m = {
                "data": {
                    "domain": "c-research.in",
                    "webmail": false,
                    "pattern": null,
                    "emails": [
                        {
                            "value": "info@c-research.in",
                            "type": "generic",
                            "confidence": 92,
                            "sources": [
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/index.php",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/privacy.php",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/auth/login.php",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/auth/register.php",
                                    "extracted_on": "2015-09-02"
                                }
                            ],
                            "first_name": null,
                            "last_name": null,
                            "position": null,
                            "linkedin": null,
                            "twitter": null,
                            "phone_number": null,
                            "organization": null
                        },
                        {
                            "value": "careers@c-research.in",
                            "type": "generic",
                            "confidence": 77,
                            "sources": [
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/index.php",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/privacy.php",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/auth/login.php",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in",
                                    "extracted_on": "2015-09-02"
                                },
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/auth/register.php",
                                    "extracted_on": "2015-09-02"
                                }
                            ],
                            "first_name": null,
                            "last_name": null,
                            "position": null,
                            "linkedin": null,
                            "twitter": null,
                            "phone_number": null,
                            "organization": null
                        },
                        {
                            "value": "rfq@c-research.in",
                            "type": "personal",
                            "confidence": 47,
                            "sources": [
                                {
                                    "domain": "c-research.in",
                                    "uri": "http://c-research.in/privacy.php",
                                    "extracted_on": "2015-09-02"
                                }
                            ],
                            "first_name": 'RFQ',
                            "last_name": 'Singha',
                            "position": null,
                            "linkedin": null,
                            "twitter": null,
                            "phone_number": null,
                            "organization": null
                        }
                    ]
                },
                "meta": {
                    "results": 3,
                    "offset": 0,
                    "params": {
                        "domain": "http://www.c-research.in",
                        "company": null,
                        "type": null,
                        "offset": null
                    }
                }
            };

            EmailCollection.findOneAndUpdate(
                {company_url: company.company_url},
                {
                    country: company.country,
                    directory: company.directory,
                    company_name: company.company_name,
                    $addToSet: {
                        emails: {
                            $each: m.data.emails.map(function (email) {
                                if (email.confidence > 40) return email.value;
                            })
                        },
                        names: {
                            $each: m.data.emails.map(function (email) {
                                if (email.confidence > 40) return email.last_name ? email.first_name + ' ' + email.last_name : email.first_name;
                            })
                        }
                    }
                },
                {new: true, upsert: true},
                function (err, res) {
                    if (err) console.log(err.message);
                    else {
                        console.log('Inserted ' +res);
                        // offset += 10;
                        // if (offset >= hunterObj.meta.results) --counter;
                        // if (!counter) Mailer.send(company.directory + ': Email Extraction Complete', 'Email extraction complete. You may now download by clicking here https://mrscraper.herokuapp.com/'+company.directory.toLowerCase()+'/download','info@c-research.in');
                        // if (hunterObj.meta.results > 10 && offset < hunterObj.meta.results) paginate();
                    }
                }
            );
        })
    });
}

module.exports = storeEmail;