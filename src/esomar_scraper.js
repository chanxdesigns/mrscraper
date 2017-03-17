var Queue = require('bull'),
    extractCountryDirPages = require('./esomar_workers/extractCountryDirPages');

function extractCompanies() {
    var directory = {dir: "esomar", dirname: "Esomar", url: "directory.esomar.org"},
        esomarWorker = Queue('Esomar Extract', process.env.REDIS_URL);

    esomarWorker.process(function (dir) {
        //console.log(dir.data);
        extractCountryDirPages(dir.data)
    });

    esomarWorker.add(directory);
}

module.exports = extractCompanies;