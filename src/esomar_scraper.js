var Queue = require('bull'),
    Rp = require('request'),
    cheerio = require('cheerio'),
    extractCompaniesList = require('./esomar_workers/extractCompaniesList');

var esomar = {
    name: 'Esomar',
    baseUrl: 'https://directory.esomar.org'
};

function extractCountries() {
    var esomarWorker = Queue('Esomar Extract', process.env.REDIS_URL || 'redis://127.0.0.1:6379'),
        links = [
            'https://directory.esomar.org/country/68-germany/',
            'https://directory.esomar.org/country/180-united-kingdom-gb/',
            'https://directory.esomar.org/country/63-france/',
            'https://directory.esomar.org/country/88-italy/',
            'https://directory.esomar.org/country/146-russian-federation/',
            'https://directory.esomar.org/country/161-spain/',
            'https://directory.esomar.org/country/124-netherlands/',
            'https://directory.esomar.org/country/167-sweden/',
            'https://directory.esomar.org/country/19-belgium/',
            'https://directory.esomar.org/country/71-greece/',
            'https://directory.esomar.org/country/178-turkey/',
            'https://directory.esomar.org/country/53-denmark/',
            'https://directory.esomar.org/country/168-switzerland/',
            'https://directory.esomar.org/country/36-canada/',
            'https://directory.esomar.org/country/181-united-states-usa/',
            'https://directory.esomar.org/country/91-japan/',
            'https://directory.esomar.org/country/95-korea-republic-of/'
        ];

    esomarWorker.process(function (directory) {
        extractCompaniesList(directory);
    });

    esomarWorker.add({url: links});
}

module.exports = {countries: extractCountries};

