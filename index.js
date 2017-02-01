/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

'use strict';

var express = require('express'),
    winston = require('winston'),
    scraper = require('./src/esomar_scraper');

// Initialize Express
var app = express();

// App Routes
app.get('/:directory/extract-companies', function (req, res) {
    scraper.extract(req.params.directory, function (data) {
        res.setHeader('content-type', 'text/plain');
        res.send(data);
    });
});

app.get('/get-companies', function (req, res) {
    scraper.getCompanies('',function (companies) {
        res.send(companies);
    })
});

app.listen(8000,function () {
    console.log("App started responding")
});