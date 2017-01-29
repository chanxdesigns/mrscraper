
var Rq = require('request-promise'),
    cheerio = require('cheerio'),
    Q = require('q'),
    https = require('https');

var directories = [{dir: "esomar", url: "directory.esomar.org", https: true}];

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

function scrapComp (normalizedLinkArr) {
    var m = [];
    normalizedLinkArr.forEach(function (item, index) {
        item.forEach(function (i) {
            m.push(i);
        })
    })

    return m.map(function (n) {
        console.log(n.es_links);
        return Rq(n.es_links)
            .then(function (data) {
                return data;
            })
    })
}

function scrapCompanies (countriesLinks) {
    return countriesLinks.map(function (countryLinks) {
        return countryLinks.esomar_links.map(function (link) {
            return {comp_name: countryLinks.country_name, es_links: link};
            // Rq(link)
            //     .then(function (data) {
            //         return data;
            //     })
            // return Rq(link)
            //     .then(function (data) {
            //         var $ = cheerio.load(data),
            //             companies_det = $('h2.mb0');
            //
            //         console.log(companies_det);
            //
            //         return companies_det;
            //
            //         // return companies_det.map(function (index,company_det) {
            //         //     //var $ = cheerio.load(company_det);
            //         //     var company_name = $(company_det).find('a').text(),
            //         //         company_esomar_url = $(company_det).find('a').attr('href');
            //         //
            //         //     return Rq(company_esomar_url)
            //         //         .then(function (web_data) {
            //         //             var $ = cheerio.load(web_data);
            //         //             return {
            //         //                 company_name: company_name,
            //         //                 company_url: $('a[data-ga-category="website"]').attr('href')
            //         //             }
            //         //         })
            //         //         .catch(function (err) {
            //         //             return err;
            //         //         })
            //         // });
            //     })
            //     .catch(function (err) {
            //         return err;
            //     })
        });
        // return countryLinks.esomar_links.map(function (link) {
        //     var linkArr = link.split('/');
        //     var options = {
        //         baseUrl: 'https://'+linkArr[2],
        //         uri: linkArr[3],
        //         timeout: 180000
        //     };
        //     return Rq(options)
        //         .then(function (d) {
        //             return d;
        //         });
        // });

    })
}

function navigateAndFetchPages (data) {
    return data.map(function (val) {
        return Rq(val.esomar_url)
            .then(function (data) {
                var $ = cheerio.load(data),
                    pages_elem = $('.mt0.mb0-5.pt0').find('a').not('.active');

                var links = [];
                for (var i = 0; i < pages_elem.length; i++) {
                    links.push($(pages_elem[i]).attr('href'));
                }

                return {
                    country_name: val.country_name,
                    esomar_links: links
                };
            })
    });
}

/***
 * Landing Page Scraping Function
 *
 * @param dir
 * @returns {*}
 */
function landingPage (dir) {
    return Rq('https://'+getDirectory(dir).url)
        .then(function (data) {
            if (data) {
                var $ = cheerio.load(data),
                    cn_europe = $('#location_europe .list-countries li'),
                    cn_asia = $('#content-location_asia_pacific li'),
                    cn_north_america = $('#content-location_north_america li');

                // Get Europe Company List
                var europe = [];

                for (var i = 0; i < cn_europe.length; i++) {
                    var country_name = $(cn_europe[i]).find('a').html().split('(')[0].trim(),
                        esomar_url = 'https://' + getDirectory(dir).url + '/' + $(cn_europe[i]).find('a').attr('href');
                    europe.push({country_name: country_name, esomar_url: esomar_url});
                }
                return europe;
            }
        })
}

var scraper = {
    extract: function (dir) {
        return landingPage(dir)
            .then(function (countries) {
                return Promise.all(navigateAndFetchPages(countries));
            })
            .then(function (countriesLinks) {
                return Promise.all(scrapCompanies(countriesLinks));
            })
            .then(function(normalizedLinkArray) {
                return scrapComp(normalizedLinkArray);
            })
            .catch();
    }
};

module.exports = scraper;