var Rp = require('request'),
    cheerio = require('cheerio');

function extractCompaniesDetails(companies_list) {
    var companies_details = [],
        counter = companies_list.length;
    companies_list.forEach(function (company) {
        Rp(company.company_gb_url, function (err, res, body) {
            if (err) console.log(err.message);
            var $ = cheerio.load(body);

            companies_details.push({
                country: company.country,
                company_name: $('.box-title h2').text(),
                company_url: $($('#tab1 .span4 > .desc-list')[1]).find('a').text()
            });

            console.log(companies_details);

            --counter;
            if (!counter) console.log(companies_details + "Counter 0. All Extracted");
        })
    })
}

module.exports = extractCompaniesDetails;