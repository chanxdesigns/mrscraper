const Rp = require('request'),
    Rpr = require('request-promise'),
    cheerio = require('cheerio'),
    storeEmails = require('./extractAndStoreCompanies'),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    Mailer = require('../misc_workers/mailer');

//require('longjohn');

function extractAllCompanies (countries_companies_pages) {
    // var companies_list = [],
    //     counter;

    Rp(countries_companies_pages, (err,res,pages) => {
        "use strict";
        var pages = JSON.parse(pages);
        //console.log(counter = pages.length);
        Promise.all(pages.map(function (country_company_page) {
            var options = {
                method: "POST",
                uri: 'http://dashboard.i-apaconline.com/getsite',
                form: {
                    url: country_company_page.page
                }
            }
            return Rpr(options)
                .then(body => {
                    if (body) {
                        var $ = cheerio.load(body),
                            companies_det = $('.bg-eso-lightblue h2.mb0'),
                            companies_list = [];

                        for (var i = 0; i < companies_det.length; i++) {
                            companies_list.push({
                                country: country_company_page.country,
                                company_name: $(companies_det[i]).find('a').first().text().trim(),
                                company_esomar_url: $(companies_det[i]).find('a').first().attr('href')
                            });
                        }
                        return companies_list;
                    }
                })
                .catch(err => {
                    return err.message;
                })
        }))
            .then(companies_list => {
                console.log(companies_list);
                var date = Date.now();
                fs.writeFile('files/company_esomar_url_'+ date +'.json', JSON.stringify(companies_list), function () {
                    //"use strict";
                    var clientOptions = {
                        accessKeyId: "AKIAJFBO2N5FZEARJXYA",
                        secretAccessKey: "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",
                        region: 'ap-south-1'
                    };
                    var s3 = new AWS.S3(clientOptions);

                    var params = {
                        Bucket: 'mrscraper',
                        Key: 'files/company_esomar_url_'+ date +'.json',
                        Body: fs.readFileSync('files/company_esomar_url_'+ date +'.json'),
                        ACL: 'public-read'
                    };

                    // Upload file to S3
                    s3.putObject(params, function (err) {
                        if (err) throw err;
                        fs.unlink('files/company_esomar_url_'+ date +'.json');
                        Mailer.send('Esomar: Extraction and Storage Complete','Esomar Extraction & Storage Of Data Complete: https://s3.ap-south-1.amazonaws.com/mrscraper/files/'+'company_esomar_url_'+ date +'.json','info@c-research.in');
                    });
                });
            })
    })
}

module.exports = extractAllCompanies;