var Queue = require('bull'),
    extractCountryDirPages = require('./esomar_workers/extractCountryDirPages');

function extractCompanies() {
    var directory = {dir: "esomar", dirname: "Esomar", url: "directory.esomar.org"},
        esomarWorker = Queue('Esomar Extract', 'redis://h:pffc3ab707f46c10f7b417658a3503dd4e85a823dafc6ccffa3c2dcf69f1a7e0d@ec2-34-198-196-38.compute-1.amazonaws.com:30179');

    esomarWorker.process(function (dir) {
        extractCountryDirPages(dir.data)
    });

    esomarWorker.add(directory);
}

module.exports = extractCompanies;