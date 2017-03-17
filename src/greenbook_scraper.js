var Queue = require('bull'),
    extractCountryPages = require('./greenbook_workers/extractCountryPages');

function extractCompanies () {
    var directory = {dir: 'greenbook', dirname: 'Greenbook', url: 'https://www.greenbook.org/'},
        greenbookWorker = Queue('Greenbook Extract', process.env.REDIS_URL);

    greenbookWorker.process(function (directory) {
        extractCountryPages(directory);
    });

    greenbookWorker.add(directory);
}

module.exports  = extractCompanies;