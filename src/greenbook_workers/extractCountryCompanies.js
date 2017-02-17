var Rp = require('request'),
    cheerio = require('cheerio'),
    extractCompaniesDetails = require('./extractCompaniesDetails');

function extractCountryCompanies (countries_page) {
    var companies_list = [],
        counter = countries_page.length;

    countries_page.forEach(function (country_page) {
        Rp(country_page.page, function (err, res, body) {
            if (err) console.log(err.message);
            if (body) {
                var $ = cheerio.load(body),
                    articles = $('article').splice(0);

                articles.forEach(function (article) {
                    var $ = cheerio.load(article);
                    companies_list.push({
                        country: country_page.country,
                        company_gb_url: 'https://www.greenbook.org/' + ($('a').first().attr('href').substr(1))
                    });
                });
                --counter;
                console.log(counter);
                if (!counter) extractCompaniesDetails(companies_list);
            }
        })
    });
}

module.exports = extractCountryCompanies;