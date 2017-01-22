var cheerio = require('cheerio'),
    http = require('http'),
    https = require('https'),
    Q = require('q');

var directories = [{dir: "esomar", url: "directory.esomar.org", https: true}];

var getDirectory = function (directoryName) {
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
};

var scrapCompanies = function (data) {
    var deferred = Q.defer(),
        $ = cheerio.load(data),
        dom = $('h2.mb0');

    var companies = [];
    for (var i = 0; i < dom.length; i++) {
        var company_name = $(dom[i]).find('a').text(),
            company_esomar_url = $(dom[i]).find('a').attr('href');

        https.get(company_esomar_url,
            function (res) {
                var data;
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    if (data) {
                        var $ = cheerio.load(data),
                            dom = $('a[data-ga-category="website"]');

                        companies.push({company_name: company_name, company_url: dom.attr('href')});
                    }
                });
            })
            .on('error', function (err) {
                throw new Error(err);
            })
            .end();
    }

    companies.length ? deferred.resolve(companies) : deferred.reject(err);
    return deferred.promise;
};

var navigateAndFetchPages = function (data) {
    var deferred = Q.defer();

    for (var i = 0; i < data.length; i++) {

        var country = data[i].country_name.split('(')[0].trim(),
            host = data[i].esomar_url.split('/')[0],
            path = '/'+data[i].esomar_url.split('/')[1]+'/';

        https.request({
            host: host,
            path: path,
            method: 'GET'
        },
            function (res) {
            var data = '';

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end',function () {
                // Start scraping company names and Esomar url
                // Once the Dom is ready
                var $ = cheerio.load(data),
                    dom = $('.mt0.mb0-5.pt0').find('a').not('.active');

                for (var i = 0; i < dom.length; i++) {
                    //console.log($(dom[i]).attr('href'));
                    if ($(dom[i]).attr('href') !== undefined) {

                        https.get($(dom[i]).attr('href'),
                        function (res) {
                            var data = '';
                            res.on('data', function (chunk) {
                                data += chunk;
                            });
                            res.on('end', function () {
                                deferred.resolve(scrapCompanies(data));
                            });
                        })
                            .on('error', function (err) {
                               deferred.reject(err);
                            })
                            .end();

                    }
                }
            })
        })
            .on('error', function (err) {
                deferred.reject(new Error(err))
        })
            .end();

    }
    return deferred.promise;
};

var landing = function (data, host) {
    var countries = {
            europe: [],
            asia: [],
            n_america: []
        };

    if (data) {
        var $ = cheerio.load(data),
            cn_europe = $('#location_europe .list-countries li'),
            cn_asia = $('#content-location_asia_pacific li'),
            cn_north_america = $('#content-location_north_america li'),
            deferred = Q.defer();

        // Get Europe Company List
        var europe = [];

        for (var i = 0; i < cn_europe.length; i++) {
            var country_name = $(cn_europe[i]).find('a').html(),
                esomar_url = host + '/' + $(cn_europe[i]).find('a').attr('href');

            europe.push({country_name: country_name, esomar_url: esomar_url});
        }

        navigateAndFetchPages(europe)

        //return def.promise;

    }
    else {
        throw "Data is empty or undefined.";
    }
}

var scraper = {
    extract: function (directoryName, cb) {
        var result = getDirectory(directoryName),
            deferred = Q.defer();

        if (result !== 404) {
            var protocol = result.https ? https : http;
            protocol.request({
                host: result.url,
                method: "GET"
            }, function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    // On successfully data receive
                    // Run the scrapLanding page and defer the results
                    deferred.resolve(landing(data, result.url));
                });
            })
                .on('error', function (err) {
                    // On error defer the error
                    deferred.reject(err);
                })
                .end();
            // Return the promise
            return deferred.promise;
        }
        else {
            return "Failed";
        }
    }
};

module.exports = scraper;