var Queue = require('bull'),
    extractCountryPages = require('./greenbook_workers/extractCountryPages');

var directory = {dir: 'greenbook', dirname: 'Greenbook', url: 'https://www.greenbook.org/'},
    greenbookWorker = Queue('Greenbook Extract', 'redis://h:pffc3ab707f46c10f7b417658a3503dd4e85a823dafc6ccffa3c2dcf69f1a7e0d@ec2-34-198-196-38.compute-1.amazonaws.com:30179');


greenbookWorker.process(function (directory) {
    extractCountryPages(directory);
});

function extractCompanies () {
    greenbookWorker.add(directory);
}

module.exports  = extractCompanies;