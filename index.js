/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    scraper = require('./src/esomar_scraper'),
    bluebook = require('./src/bluebook_scraper'),
    csv = require('./src/csv_maker'),
    api_keys = require('./src/api_keys');

// Initialize Express
var app = express();

// Set Local App Variables
app.set('views', './views');
app.set('view engine', 'pug');

// Post Body Parser
app.use(bodyParser.urlencoded({extended: true}));

/**
 * App Routes
 */

// Homepage
app.get('/', function (req, res) {
    res.render('home');
});

// Extract Esomar Companies
app.get('/esomar/extract-companies', function (req, res) {
    scraper.extractCompanies();
    res.setHeader('content-type', 'text/html');
    res.send('<h3 style="font-family: Open Sans, sans-serif">Extraction in Progress, You will receive an E-Mail after extraction is completed.</h3>');
});

// Extract Esomar E-Mail
app.get('/esomar/extract-email', function (req, res) {
    // scraper.extractEmail(res, function (data) {
    //     res.send(data);
    // })
});

// Extract Bluebook
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

// Download Companies
app.get('/get-companies', function (req, res) {
    scraper.getCompanies(function (companies) {
        res.send(companies);
    })
});

/**
 * Api Keys
 */
app.get('/api-keys', function (req, res) {
    res.render('api-key-form');
});

//Submit API Key
app.post('/submit', function (req, res) {
    api_keys.insert(req.body.api_keys, function (data) {
        res.send(data);
    });
});

// Download E-MAILS List CSV File
app.get('/:directory/download', function (req, res) {
    csv(req.params.directory, function (file_url) {
        var html = '<a style="margin: 50px 0 0 20px;text-decoration: none;padding: 10px 20px;background: #2ECC71; border-radius: 4px;color: white;font-family: Helvetica, Arial, sans-serif;text-align: center;" href="' + file_url + '">Download</a>';
        res.send(html);
    })
});

// Start Request Listening
app.listen(process.env.PORT || 5000, function () {
    console.log("App started responding")
});