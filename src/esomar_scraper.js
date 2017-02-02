
var mongoose = require('mongoose'),
    request = require('request'),
    cheerio = require('cheerio'),
    DB = require('./dbconn'),
    https = require('https');

var directories = [{dir: "esomar", dirname: "Esomar", url: "directory.esomar.org", https: true}];

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
 * @param dir
 * @returns {*}
 */
function extractCompanies (dir, callback) {
    request('https://'+getDirectory(dir).url, function (err, res, body) {
        if (body) {
            // Extract Countries Continents
            var $ = cheerio.load(body),
                cn_europe = $('#location_europe .list-countries li'),
                cn_asia = $('#content-location_asia_pacific li'),
                cn_north_america = $('#content-location_north_america li');

            // Get Europe Company List
            var companies = [];

            for (var i = 0; i < cn_europe.length; i++) {
                companies.push({
                    country_name: $(cn_europe[i]).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + getDirectory(dir).url + '/' + $(cn_europe[i]).find('a').attr('href')
                });
            }
            
            for (var i = 0; i < cn_asia.length; i++) {
                companies.push({
                    country_name: $(cn_asia[i]).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + getDirectory(dir).url + '/' + $(cn_asia[i]).find('a').attr('href')
                });
            }

            for (var i = 0; i < cn_north_america.length; i++) {
                companies.push({
                    country_name: $(cn_north_america[i]).find('a').html().split('(')[0].trim(),
                    esomar_url: 'https://' + getDirectory(dir).url + '/' + $(cn_north_america[i]).find('a').attr('href')
                });
            }

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
                                                    directory: getDirectory(dir).dirname,
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
                    //if (!counter) callback("Extracting Completed.");
                });
            });
            callback("Extracting Data, Please Wait");
        }
    });
}

function extractEmail (dir, callback) {
    var Companies = mongoose.model('Companies', DB.companySchema),
        EmailCollection = mongoose.model('CompaniesEmail', DB.companyEmailSchema),
        query = Companies.find({});

    query.exec(function (err, companies) {
        var counter = companies.length;
        console.log('Total '+counter)
        companies.forEach(function (company) {
            if (company.company_url !== 404) {
                // var queryUri = 'https://api.hunter.io/v2/domain-search?domain='+company.company_url+'&api_key=26d5415191770bbeb981e72cd965cf457e37d379';
                // request(queryUri, function (err, res) {
                //     if (err) console.log(err);
                //     var Email = new EmailCollection({
                //         country: company.country,
                //         company_name: company.company_name,
                //         company_url: company.company_url,
                //         emails: res.data.emails.map(function (email) {
                //             return email.confidence > 40 ? email.value : false;
                //         })
                //     });
                //     Email.save(function (err) {
                //         if (err) console.log('Saving Error');
                //     });
                     --counter;
                // })
            }
            else {
                --counter;
            }
            console.log(counter, company.company_url);
            if (!counter) callback('Email Extraction Completed.');
        })
    })
}

function getCompanies(dir,callback) {
    var Companies = mongoose.model('Companies', DB.companySchema);
    var query = Companies.find({});
    query.exec(function (err, companies) {
        if (err) {
            console.log("Somethings wrong while retrieving "+err);
            return "Somethings wrong while retrieving "+err;
        }
        callback(companies);
    })
}

// Initiate Database Connection
DB.makeDbConn();

var scraper = {
    extract: function (dir, callback) {
        extractCompanies(dir, function (data) {
            callback(data);
        })
    },
    getCompanies: getCompanies,
    extractEmail: extractEmail
};

module.exports = scraper;