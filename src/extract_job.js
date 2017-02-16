var kue = require('kue'),
    queue = kue.createQueue(),
    request = require('request'),
    mongoose = require('mongoose'),
    cheerio = require('cheerio');

    var jobs = queue.create('test_job').save();

    jobs.on('complete', function (res) {
        console.log(res);
    });
    jobs.on('failed attempt', function (res) {
        console.log(res);
    });

queue.process('test_job', function (job, done) {
    console.log('Processing Job of '+job.id);
    done(null, 'Result');
});

//newJob();

//module.exports = newJob;