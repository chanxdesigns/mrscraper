var Rp = require('request'),
    cheerio = require('cheerio');

function extractAllCompanies (countries_companies_pages) {
    var companies_list = [],
        counter = countries_companies_pages.length;

    countries_companies_pages.forEach(function (country_company_page) {
        Rp(country_company_page.page, function (err, res, body) {
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
                console.log('Extracting Company Esomar URL: '+counter, companies_list);
                if (!counter) console.log('Extract complete', companies_list);
            }
        })
    });
}

module.exports = extractAllCompanies;