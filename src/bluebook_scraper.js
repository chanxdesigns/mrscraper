var request = require('request'),
    Rp = require('request-promise'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    DB = require('./dbconn');

var bluebook = {
    name: "Bluebook",
    host: "https://bluebook.insightsassociation.org/",
    mainPath: "marketing_research_firms_and_services.cfm"
};

function extractPages () {
    return Rp(bluebook.host + bluebook.mainPath)
        .then(function (body) {
            if (body !== undefined) {
                var $ = cheerio.load(body),
                    raw = $('.search-total select option');
                return raw.splice(0, (raw.length / 2));
            }
        })
        .catch(function (err) {
            return err;
        })
}

function extractCompanies (pagesElem) {
    return pagesElem.map(function (page) {
        var $ = cheerio.load(page),
            url = $(page).val();
        return Rp(bluebook.host+url)
            .then(function (body) {
                    var $ = cheerio.load(body);
                        return $('.search-list #resultsDet').splice(0);
            })
            .catch(function (err) {
                return err;
            })
    })
}

function extractMails (companies) {
    return companies.map(function (company) {
        if (company !== undefined) {
            var $ = cheerio.load(company);
            var compList = $(company).find('#listInfo span'),
                bb_url = $(compList).find('a').attr('href');
            return Rp(bluebook.host + (bb_url.trim().slice(1)))
                .then(function (body) {
                    var $ = cheerio.load(body),
                        compDetails = $('#companycontactstable2 tr').first().html();
                    return {
                        compName: $('.details-top').find('h1').text(),
                        emails: compDetails.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
                    }
                })
        }
    })
}

function insert (companies) {
    return companies.map(function (company) {
        var BluebookMail = mongoose.model('BlueBookMail', DB.companyEmailSchema);
        BluebookMail.findOneAndUpdate(
            {
                directory: "Bluebook",
                company_url: 'www.'+company.emails[0].split('@')[1]
            },
            {
                company_name: company.compName,
                emails: company.emails.reduce(function (result, email) {
                    if (result.indexOf(email) < 0) {
                        result.push(email);
                    }
                    return result;
                },[])
            },
            {
                upsert: true,
                new: true
            },
            function (err) {
                if (err) throw err;
            }
        )
    })
}

module.exports = {page: extractPages, companies: extractCompanies, mails: extractMails, insert: insert};
