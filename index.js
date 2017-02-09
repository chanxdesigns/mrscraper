/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    scraper = require('./src/esomar_scraper'),
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

// Extract Companies
app.get('/:directory/extract-companies', function (req, res) {
    scraper.extract(req.params.directory, function (data) {
        res.setHeader('content-type', 'text/plain');
        res.send(data);
    });
});

// Extract E-Mail
app.get('/:directory/extract-email', function (req, res) {
    scraper.extractEmail(req.params.directory,function (data) {
        res.send(data);
    })
});

// Download Companies
app.get('/get-companies', function (req, res) {
    scraper.getCompanies('',function (companies) {
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
app.get('/download', function (req, res) {
    csv(function (file_url) {
        var html = '<a style="margin: 50px 0 0 20px;text-decoration: none;padding: 10px 20px;background: #2ECC71; border-radius: 4px;color: white;font-family: Helvetica, Arial, sans-serif;text-align: center;" href="'+file_url+'">Download</a>';
        res.send(html);
    })
});

// Start Request Listening
app.listen(8000,function () {
    console.log("App started responding")
});