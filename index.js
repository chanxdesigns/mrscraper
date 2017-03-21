/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    DB = require('./src/misc_workers/dbconn'),
    esomar = require('./src/esomar_scraper'),
    bluebook = require('./src/bluebook_scraper'),
    greenbook = require('./src/greenbook_scraper'),
    emails = require('./src/misc_workers/extract_emails'),
    csv = require('./src/misc_workers/csv_maker'),
    api_keys = require('./src/misc_workers/api_keys');

// Initialize Express
var app = express();

// Set Local App Variables
app.set('views', './views');
app.set('view engine', 'pug');

// Post Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/**
 * Homepage
 */
app.get('/', function (req, res) {
    res.render('home');
});

/**
 * Extract Esomar Companies
 */
app.get('/esomar/extract-companies', function (req, res) {
    esomar();
    res.setHeader('content-type', 'text/html');
    res.send('<h3 style="font-family: Open Sans, sans-serif">Extraction in Progress, You will receive an E-Mail after extraction is completed.</h3>');
});

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
        .then(function (pagesArr) {
            return Promise.all(bluebook.mails(pagesArr));
        })
        .then(function () {
            res.send("Email Extraction and Insertion Completed")
        })
        .catch(function (err) {
            console.log(err.message);
        })
});

/**
 * Extract Emails
 */
app.get('/:directory/extract-emails', function (req, res) {
    emails(req.params.directory, (data) => {
        "use strict";
        res.send(data)
    });
});

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
    csv(req.params.directory, function (file_url) {
        var html = '<a style="margin: 50px 0 0 20px;text-decoration: none;padding: 10px 20px;background: #2ECC71; border-radius: 4px;color: white;font-family: Helvetica, Arial, sans-serif;text-align: center;" href="' + file_url + '">Download</a>';
        res.send(html);
    })
});

/**
 * Parse Post
 */
app.post('/companies/submit', function (req, res) {
    console.log(req.body);
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send('Yo');
})

/**
 * Start HTTP Server Request Listening
 */
app.listen(process.env.PORT || 5000, function () {
    DB.makeDbConn();
    console.log('App and Database started')
});