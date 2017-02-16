var Rp = require('request-promise'),
    cheerio = require('cheerio');

function extractCountryDirPages (directory) {
    return Rp('https://'+directory.url)
        .then(function extract (body) {
            if (body) {
                // Extract Countries Continents
                var $ = cheerio.load(body),
                    cn_europe = $('#location_europe .list-countries li').splice(0),
                    cn_asia = $('#content-location_asia_pacific li').splice(0),
                    cn_north_america = $('#content-location_north_america li').splice(0);

                // Get Company List
                var companies = [];

                cn_europe.forEach(function (europe) {
                    companies.push({
                        country_name: $(europe).find('a').html().split('(')[0].trim(),
                        esomar_url: 'https://' + directory.url + '/' + $(europe).find('a').attr('href')
                    });
                });

                cn_asia.forEach(function (asia) {
                    companies.push({
                        country_name: $(asia).find('a').html().split('(')[0].trim(),
                        esomar_url: 'https://' + directory.url + '/' + $(asia).find('a').attr('href')
                    });
                });

                cn_north_america.forEach(function (n_america) {
                    companies.push({
                        country_name: $(n_america).find('a').html().split('(')[0].trim(),
                        esomar_url: 'https://' + directory.url + '/' + $(n_america).find('a').attr('href')
                    });
                });

                return companies;
            }
        })
}

module.exports = extractCountryDirPages;