var Queue = require('bull'),
    extractCountryDirPages = require('./esomar_workers/extractCountryDirPages');

function extractCompanies() {
    var directory = {dir: "esomar", dirname: "Esomar", url: "directory.esomar.org"},
        esomarWorker = Queue('Esomar Extract', 6379, '127.0.0.1');

    esomarWorker.process(function (dir) {
        //console.log(dir.data);
        extractCountryDirPages(dir.data)
    });

    esomarWorker.add(directory);
}

module.exports = extractCompanies;