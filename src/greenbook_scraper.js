var Queue = require('bull'),
    extractCountryPages = require('./greenbook_workers/extractCountryPages');

var directory = {dir: 'greenbook', dirname: 'Greenbook', url: 'https://www.greenbook.org/'},
    greenbookWorker = Queue('Greenbook Extract', 6379, '127.0.0.1');


greenbookWorker.process(function (directory) {
    extractCountryPages(directory);
});

function extractCompanies () {
    greenbookWorker.add(directory);
}

module.exports  = extractCompanies;