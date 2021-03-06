/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    DB = require('./src/misc_workers/dbconn'),
    bluebook = require('./src/bluebook_scraper'),
    greenbook = require('./src/greenbook_scraper'),
    esomar = require('./src/esomar_scraper'),
    store_comp = require('./src/misc_workers/store_companies'),
    emails = require('./src/misc_workers/extract_emails'),
    emails_v2 = require('./src/extract_mail_v2'),
    mailer = require('./src/misc_workers/mailer'),
    companies_csv = require('./src/misc_workers/companies_csv'),
    emails_csv = require('./src/misc_workers/emails_csv'),
    api_keys = require('./src/misc_workers/api_keys')

// Initialize Express
var app = express();

// Set Local App Variables
app.set('views', './views');
app.set('view engine', 'pug');

// Post Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

/**
 * Homepage
 */
app.get('/', function (req, res) {
    res.render('home');
});

/**
 * Extract Esomar Companies
 */
app.post('/companies/submit', bodyParser.json(), function (req, res) {
    if (req.body) {
        var datas = JSON.parse(req.body.data);
        store_comp(datas, function () {
            res.set('Access-Control-Allow-Origin', '*');
            res.status(200).send("complete");
        })
    }
})

/**
 * Extract Greenbook Companies
 */
app.get('/greenbook/extract-companies', function (req, res) {
    greenbook();
    res.setHeader('content-type', 'text/html');
    res.send('<h3 style="font-family: Open Sans, sans-serif">Extraction in Progress, You will receive an E-Mail after extraction is completed.</h3>');
});

/**
 * Extract Bluebook
 */
app.get('/bluebook/extract-email', function (req, res) {
    bluebook.companies()
        .then(function (length) {
            res.json(length)
        });
});

app.get('/esomar/extract-companies', function (req, res) {
    esomar.countries();
});

/**
 * Extract Emails
 */
app.get('/extract-emails', function (req, res) {
    res.render('extract-email');
});

/**
 * Notify Mail After Mail Extraction
 * Based On jQuery Extraction
 */
app.post('/notify/mail', function (req, res) {
    mailer.send(req.body.sub,req.body.msg,req.body.to);
    res.send("success");
})

/**-----------------------------------------------------------------------------
 |
 |  Extra Functions Other Than The Main
 |
 |----------------------------------------------------------------------------*/

/**
 * Api Keys
 */
app.get('/api-keys', function (req, res) {
    res.render('api-key-form');
});

/**
 * Submit API Key
 */
app.post('/submit', function (req, res) {
    api_keys.insert(req.body.api_keys, function (data) {
        res.send(data);
    });
});

/**
 * Download Companies List CSV File
 */
app.get('/:directory/download', function (req, res) {
    companies_csv(req.params.directory, function (file_url) {
        var html = '<a style="margin: 50px 0 0 20px;text-decoration: none;padding: 10px 20px;background: #2ECC71; border-radius: 4px;color: white;font-family: Helvetica, Arial, sans-serif;text-align: center;" href="' + file_url + '">Download</a>';
        res.send(html);
    })
});

/**
 * Download Emails List CSV File
 */
app.get('/:directory/download/emails', function (req, res) {
    emails_csv.generateEmailsCsv(req.params.directory, function (file_url) {
        var html = '<a style="margin: 50px 0 0 20px;text-decoration: none;padding: 10px 20px;background: #2ECC71; border-radius: 4px;color: white;font-family: Helvetica, Arial, sans-serif;text-align: center;" href="' + file_url + '">Download</a>';
        res.send(html);
    })
});

app.get('/:directory/emails/website', function (req, res) {
    emails_csv.carbonCopy(req.params.directory, function (file_url) {
        var html = '<a style="margin: 50px 0 0 20px;text-decoration: none;padding: 10px 20px;background: #2ECC71; border-radius: 4px;color: white;font-family: Helvetica, Arial, sans-serif;text-align: center;" href="' + file_url + '">Download</a>';
        res.send(html);
    });
});

/**
 * Start HTTP Server Request Listening
 */
app.listen(process.env.PORT || 5000, function () {
    DB.makeDbConn();
    console.log('App and Database started')
});
