const Rp = require('request'),
    cheerio = require('cheerio'),
    storeEmails = require('./extractAndStoreCompanies'),
    Mailer = require('../misc_workers/mailer');

//require('longjohn');

function extractAllCompanies (countries_companies_pages) {
    var companies_list = [],
        counter = countries_companies_pages.length;

    countries_companies_pages.forEach(function (country_company_page) {
        Rp.post({url: 'http://dashboard.i-apaconline.com/getsite', form: {url: country_company_page.page}}, (err,res,body) => {
            if (err) console.log(err.message);
                if (body) {
                    var $ = cheerio.load(body),
                        companies_det = $('.bg-eso-lightblue h2.mb0');

                    companies_list.push({
                        country: country_company_page.country,
                        company_name: companies_det.find('a').first().text().trim(),
                        company_esomar_url: companies_det.find('a').first().attr('href')
                    });

                    --counter;
                    //console.log('Extracting Company Esomar URL: ' + counter);
                    if (!counter) {
                        Promise.all(storeEmails(companies_list))
                            .then((data) => {
                                console.log(data);
                                Mailer.send('Esomar: Extraction and Storage Complete','Esomar Extraction & Storage Of Data Complete','info@c-research.in');
                            })
                            .catch((err) => {
                                Mailer.send('Oops: Very Bad', 'Something Nasty Happened, Error: ' + err.message, 'info@c-research.in');
                            });
                        //console.log('Extract complete', companies_list);
                    }
                }
        })
        // Rp({url: country_company_page.page, timeout: 300000}, function (err, res, body) {
        //     if (err) console.log(err.message);
        //     if (body) {
        //         var $ = cheerio.load(body),
        //             companies_det = $('.bg-eso-lightblue h2.mb0');
        //
        //         companies_list.push({
        //             country: country_company_page.country,
        //             company_name: companies_det.find('a').first().text().trim(),
        //             company_esomar_url: companies_det.find('a').first().attr('href')
        //         });
        //
        //         --counter;
        //         console.log('Extracting Company Esomar URL: ' + counter, companies_list);
        //         if (!counter) {
        //             Promise.all(storeEmails(companies_list))
        //                 .then((data) => {
        //                     console.log(data);
        //                     Mailer.send('Esomar: Extraction and Storage Complete','Esomar Extraction & Storage Of Data Complete','info@c-research.in');
        //                 })
        //                 .catch((err) => {
        //                     Mailer.send('Oops: Very Bad', 'Something Nasty Happened, Error: ' + err.message, 'info@c-research.in');
        //                 });
        //         }
        //         //console.log('Extract complete', companies_list);
        //     }
        // })
    });
}

module.exports = extractAllCompanies;