const cheerio = require('cheerio'),
      extractAllCompaniesInfo = require('./extractAllCompaniesInfo'),
      Rp = require('request'),
      fs = require('fs'),
      Mailer = require('../misc_workers/mailer'),
     AWS = require('aws-sdk');

function extractCountryCompanyPages(countriesEsomarUrl) {
    var counter = countriesEsomarUrl.length,
        country_company_pages = [];

    countriesEsomarUrl.forEach(function (countryEsomarUrl) {
        Rp.post({url: 'http://dashboard.i-apaconline.com/getsite', form: {url: countryEsomarUrl.esomar_url}}, function (err, res, body) {
            if (err) console.log(err);
            if (body) {
                var $ = cheerio.load(body),
                    pages_elem = $('.mt0.mb0-5.pt0').find('a').not('.active').splice(0);

                pages_elem.forEach(function (page_elem) {
                    country_company_pages.push({
                        country: countryEsomarUrl.country_name,
                        page: $(page_elem).attr('href')
                    });
                });
                --counter;
                //console.log('Fetching Country Companies Pagination: ' + counter, country_company_pages);
                if (!counter) {
                    var date = Date.now();
                    fs.writeFile('files/country_company_page_'+ date +'.json', JSON.stringify(companies_list), function () {
                        //"use strict";
                        var clientOptions = {
                            accessKeyId: "AKIAJFBO2N5FZEARJXYA",
                            secretAccessKey: "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",
                            region: 'ap-south-1'
                        };
                        var s3 = new AWS.S3(clientOptions);

                        var params = {
                            Bucket: 'mrscraper',
                            Key: 'files/country_company_page_'+ date +'.json',
                            Body: fs.readFileSync('files/country_company_page_'+ date +'.json'),
                            ACL: 'public-read'
                        };

                        // Upload file to S3
                        s3.putObject(params, function (err) {
                            if (err) throw err;
                            fs.unlink('files/country_company_page_'+ date +'.json');
                            Mailer.send('Esomar: Extraction and Storage Complete','Esomar Extraction & Storage Of Data Complete: https://s3.ap-south-1.amazonaws.com/mrscraper/files/'+'country_company_page_'+ date +'.json','info@c-research.in');
                        });
                    });
                    extractAllCompaniesInfo(country_company_pages);
                }
            }
        })
    })
}

module.exports = extractCountryCompanyPages;