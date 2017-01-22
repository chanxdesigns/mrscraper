/* ------------------------------------------------------------
 * The Market Research Company Scraper
 *
 * For http://www.c-research.in
 * Built with Love by Chanx Singha <chanx.designs@gmail.com>
 */

'use strict';

var express = require('express'),
    winston = require('winston'),
    scraper = require('./src/esomar_scarper');

// Initialize Express
var app = express();

// App Routes
app.get('/:directory/extract-email', function (req, res) {
    scraper.extract(req.params.directory).then(function (data) {
        res.send(data);
    });
});

app.listen(8000,function () {
    console.log("App started responding")
});