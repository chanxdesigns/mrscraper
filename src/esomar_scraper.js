
var mongoose = require('mongoose'),
    request = require('request'),
    cheerio = require('cheerio'),
    DB = require('./dbconn'),
    mail = require('./mailer');

var directories = [{dir: "esomar", dirname: "Esomar", url: "directory.esomar.org"}];

/**
 * Get Individual Directory
 *
 * @param directoryName
 * @returns {*}
 */
function getDirectory (directoryName) {
    try {
        // If directory not specified by the user
        if (directoryName === undefined) throw 404;

        // Directory availability counter
        var counter = 0;
        // Loop through the preset company directories folder
        for (var i = 0; i < directories.length; i++) {
            if (directories[i].dir === directoryName) {
                counter++;
                return directories[i];
            }
        }

        // If counter not increased from 0
        // then directory doesn't exists
        if (!counter) throw 404;
    }
    catch (err) {
        return err;
    }
}

/***
 * Landing Page Scraping Function
 *
 * @param response
 * @param callback
 * @returns {*}
 */
function extractCompanies (response, callback) {
    request('https://'+getDirectory('esomar').url, function (err, res, body) {
        if (body) {
            // Extract Countries Continents
            var $ = cheerio.load(body),
                cn_europe = $('#location_europe .list-countries li'),
                cn_asia = $('#content-location_asia_pacific li'),
                cn_north_america = $('#content-location_north_america li');

            // Get Company List
            var companies = [];

            for (var i = 0; i < cn_europe.length; i++) {
                companies.push({
                    country_name: $(cn_europe[i]).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + getDirectory('esomar').url + '/' + $(cn_europe[i]).find('a').attr('href')
                });
            }
            
            for (var i = 0; i < cn_asia.length; i++) {
                companies.push({
                    country_name: $(cn_asia[i]).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + getDirectory('esomar').url + '/' + $(cn_asia[i]).find('a').attr('href')
                });
            }

            for (var i = 0; i < cn_north_america.length; i++) {
                companies.push({
                    country_name: $(cn_north_america[i]).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + getDirectory('esomar').url + '/' + $(cn_north_america[i]).find('a').attr('href')
                });
            }

            // Get Companies Details
            var counter = companies.length;
            companies.forEach(function (val) {
                request(val.esomar_url, function (err, res, body) {
                    var $ = cheerio.load(body),
                        pages_elem = $('.mt0.mb0-5.pt0').find('a').not('.active');

                    var links = [];
                    for (var i = 0; i < pages_elem.length; i++) {
                        links.push($(pages_elem[i]).attr('href'));
                    }

                    links.forEach(function (link) {
                        request(link, function (err, res, body) {
                            if (body !== undefined) {
                                var $ = cheerio.load(body),
                                    companies_det = $('h2.mb0');

                                for (var i = 0; i < companies_det.length; i++) {
                                    var company_esomar_url = $(companies_det[i]).find('a').attr('href');

                                    if (company_esomar_url !== undefined) {
                                        request(company_esomar_url, function (err, res, body) {
                                            if (body !== undefined) {
                                                var $ = cheerio.load(body);
                                                var Companies = mongoose.model('Companies', DB.companySchema);
                                                var company = new Companies({
                                                    country: val.country_name,
                                                    directory: getDirectory('esomar').dirname,
                                                    company_name: $('h1.uppercase.mb0').text().trim(),
                                                    company_url: $('a[data-ga-category="website"]').attr('href') !== undefined ? $('a[data-ga-category="website"]').attr('href') : 404
                                                });

                                                company.save(function (err, res) {
                                                    if (err) console.log("Somethings wrong while saving: "+err);
                                                    else console.log("Inserted "+ res);
                                                })
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    });
                    --counter;
                    if (!counter) {
                        mail.send('Companies Extraction Completed', 'This is to notify you that your companies extraction job is completed. You may now extract e-mails by visiting http://'+response.hostname+'/esomar/extract-email','chanx.singha@c-research.in');
                        callback("Extraction Completed.");
                    }
                });
            });
            //callback("Extracting Data, Please Wait");
        }
    });
}

/**
 * Extract Emails
 *
 * @param response
 * @param callback
 */
function extractEmail (response, callback) {
    var Companies = mongoose.model('Companies', DB.companySchema),
        EmailCollection = mongoose.model('CompaniesEmail', DB.companyEmailSchema),
        Api = mongoose.model('ApiKeys', DB.apiKeySchema),
        CompaniesQuery = Companies.find({});

    CompaniesQuery.exec(function (err, companies) {
        var counter = companies.length;
        companies.forEach(function (company) {
            var queryUri;
            function getKey () {
                var apikey = Api.findOne({'usage': true});
                apikey.exec(function (err, apikey) {
                    queryUri = 'https://api.hunter.io/v2/domain-search?domain='+ company.company_url +'&api_key='+apikey.key;
                    request(queryUri, function (err, res, body) {
                        if (err) throw err;
                        var hunterObj = JSON.parse(body);
                        if (hunterObj.errors) {
                            Api.findOneAndUpdate(
                                {
                                    key: apikey.key
                                },
                                {
                                    usage: false
                                },
                                function (err) {
                                    if (err) throw err;
                                    console.log('API KEY UPDATED');
                                    getKey();
                                }
                            );
                        }
                        else {
                            if (hunterObj.data.emails.length !== 0) {
                                var offset = 0;
                                function getMoreEmail () {
                                    if (hunterObj.meta.results > 10) {
                                        var url = offset >= 10 ? queryUri+'&offset='+offset : queryUri;
                                    }
                                    else {
                                        url = queryUri;
                                    }
                                    request(url, function (err, res, body) {
                                        if (err) console.log(err);
                                        var moreMail = JSON.parse(body);
                                        EmailCollection.findOneAndUpdate(
                                            {
                                                company_url: company.company_url
                                            },
                                            {
                                                country: company.country,
                                                company_name: company.company_name,
                                                directory: company.directory,
                                                $addToSet: {
                                                    emails: {
                                                        $each: moreMail.data.emails.map(function (email) {
                                                            if (email.confidence > 40) return email.value;
                                                        })
                                                    }
                                                },
                                                first_name: moreMail.data.emails.forEach(function (email) {
                                                    return email.first_name;
                                                })
                                            },
                                            {
                                                new: true,
                                                upsert: true
                                            }, function (err) {
                                                if (err) console.log(err);
                                                else {
                                                    offset += 10;
                                                    //if (offset >= hunterObj.meta.results) ;
                                                    if (hunterObj.meta.results > 10 && offset < hunterObj.meta.results) getMoreEmail();
                                                }
                                            });
                                    });
                                }
                                getMoreEmail();
                                --counter;
                                if (!counter) {
                                    mail.send('Email Extraction Completed', 'This is to notify you that your e-mail extraction is completed. You may now download the csv file. To download visit http://'+response.hostname+'/download','chanx.singha@c-research.in');
                                    callback('Extraction Completed!');
                                }
                            }
                            else {
                                --counter;
                                if (!counter) {
                                    mail.send('Email Extraction Completed', 'This is to notify you that your e-mail extraction is completed. You may now download the csv file. To download visit http://'+response.hostname+'/download','chanx.singha@c-research.in');
                                    callback('Extraction Completed!');
                                }
                            }
                        }
                    });
                });
            }
            getKey();
        });
    })
}

/**
 * Get Companies
 * Allows you to download Companies as CSV file
 *
 * @param callback
 */
function getCompanies(callback) {
    var Companies = mongoose.model('Companies', DB.companySchema);
    var query = Companies.find({});
    query.exec(function (err, companies) {
        if (err) {
            return "Somethings wrong while retrieving "+err;
        }
        callback(companies);
    })
}

/**
 * Initiate Database Connection
 */
DB.makeDbConn();

var scraper = {
    extract: function (res, callback) {
        extractCompanies(res, function (data) {
            callback(data);
        })
    },
    getCompanies: getCompanies,
    extractEmail: extractEmail
};

module.exports = scraper;