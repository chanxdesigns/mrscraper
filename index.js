/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

'use strict';

var express = require('express'),
    winston = require('winston'),
    scraper = require('./src/esomar_scraper'),
    csv = require('./src/csv_maker');

// Initialize Express
var app = express();

// App Routes
app.get('/:directory/extract-companies', function (req, res) {
    scraper.extract(req.params.directory, function (data) {
        res.setHeader('content-type', 'text/plain');
        res.send(data);
    });
});

app.get('/:directory/extract-email', function (req, res) {
    scraper.extractEmail(req.params.directory,function (data) {
        res.send(data);
    })
});

app.get('/get-companies', function (req, res) {
    scraper.getCompanies('',function (companies) {
        res.send(companies);
    })
});

app.get('/download', function (req, res) {
    csv(function (file_url) {
        var html = '<a style="margin: 50px 0 0 20px;text-decoration: none;padding: 10px 20px;background: #2ECC71; border-radius: 4px;color: white;font-family: Helvetica, Arial, sans-serif;text-align: center;" href="'+file_url+'">Download</a>';
        res.send(html);
    })
});

app.listen(8000,function () {
    console.log("App started responding")
});