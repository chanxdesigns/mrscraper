/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

'use strict';

var express = require('express'),
    winston = require('winston'),
    scraper = require('./src/scraper');

// Initialize Express
var app = express();

// App Routes
app.get('/:directory', function (req, res) {
    var n = scraper.extractEmail(req.params.directory);
    console.log(n);
    res.send(n);
});

app.get('/', function (req, res) {
    return "Test";
});

app.listen(8000,function () {
    console.log("App started responding")
});