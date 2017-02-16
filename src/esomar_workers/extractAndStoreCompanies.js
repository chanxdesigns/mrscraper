var Rp = require('request-promise'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

function extractAndStoreCompanies (companies_elem) {
    var companies_elem_arr = [];
    companies_elem.forEach(function (company_elems) {
            companies_elem_arr.push(company_elems);
    });

    return companies_elem_arr.map(function (company_elem) {
        if (company_elem) {
            var $ = cheerio.load(company_elem);
            var company_esomar_url = $(company_elem).find('a').attr('href');

            return Rp(company_esomar_url)
                .then(function (body) {
                    var $ = cheerio.load(body),
                        compUrl = $('a[data-ga-category="website"]').attr('href');
                    return compUrl;
                })
                .then(function (compUrl) {
                    console.log(compUrl);

                    var Companies = mongoose.model('Companies', DB.companySchema);
                    var c_promises = Companies.findOne({company_url: compUrl}).exec();

                    return c_promises
                        .then(function (data) {
                            if (!data) {
                                var Email = new Companies({
                                    country: val.country_name,
                                    directory: getDirectory('esomar').dirname,
                                    company_name: $('h1.uppercase.mb0').text().trim(),
                                    company_url: compUrl
                                });
                                Email.save(function (err, res) {
                                    if (err) return err.message;
                                    return res;
                                })
                            }
                        })
                        .catch(function (err) {
                            return err.message;
                        });
                })
        }
    })
}

module.exports = extractAndStoreCompanies;