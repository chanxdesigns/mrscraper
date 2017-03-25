const db_name = 'heroku_5lpx8nq1';
const mongodbBaseUri = `https://api.mlab.com/api/1/databases/${db_name}/`;

var hunter = {
    /** Mongo URI **/
    mongoUri: mongodbBaseUri + `collections/apikeys`,

    /**
     * Update exhausted hunter keys usage to {false}
     * @param api
     * @returns {Promise|Promise.<T>}
     */
    setHunterApiKeys: (api) => {
        "use strict";
        const key = `?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz`;
        const opts = {
            url: hunter.mongoUri + `/${api._id.$oid}` + key,
            type: 'PUT',
            data: JSON.stringify({"usage": false}),
            contentType: "application/json"
        }
        return $.when($.ajax(opts))
            .then(() => 1)
            .catch(err => err);
    },

    /**
     * Get Hunter Api Keys where usage {true}
     * @returns {Promise|Promise.<T>}
     */
    getHunterApiKeys:  () => {
        "use strict";
        const uri = hunter.mongoUri + `?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"usage":true})}&fo=true`;
        return $.when($.get(uri))
            .then(api => {
                return $.get('https://api.hunter.io/v2/account/?api_key='+api.key)
                    .then(user => {
                        if (user.data.calls.used >= user.data.calls.available) {
                            return hunter.setHunterApiKeys(api)
                                .then(() => {
                                    return hunter.getHunterApiKeys()
                                        .then(api => api)
                                        .catch(err => err);
                                })
                                .catch(err => err);
                        }
                        return api;
                    })
                    .catch(err => err);
            })
            .catch(err => err);
    }
}

function getCompanies (dir) {
    "use strict";
    const uri = mongodbBaseUri + `collections/companies?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"directory":dir[0].toUpperCase()+dir.substr(1)})}&l=0`;
    return $.get(uri);
}

function checkForAvailability (company,dir) {
    const uri = mongodbBaseUri + `collections/companiesemails?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"directory":dir[0].toUpperCase()+dir.substr(1), "company_url":company.company_url})}&fo=true`;
    return $.get(uri);
}

function protocolChecker (url) {
    let urlArr = url.split('//');
    if (urlArr[0] == "http:" || urlArr[0] == "https:") {
        return url;
    }
    return "http://" + url;
}

getCompanies(location.search.substr(1).split('=')[1])
    .then(companies => {
        "use strict";
        Promise.all(companies.map(company => {
            if (company.company_url !== "404") {
                return hunter.getHunterApiKeys()
                    .then(api => {
                        return checkForAvailability(company, location.search.substr(1).split('=')[1])
                            .then(data => {
                                if (!data) {
                                    const uri = `https://api.hunter.io/v2/domain-search?domain=${protocolChecker(company.company_url)}&api_key=${api.key}`;
                                    return $.get(uri)
                                        .then(mailObj => mailObj.data)
                                        .catch(d => {
                                            if (d.responseJSON.errors) {
                                                return d.responseJSON.errors[0].message;
                                            }
                                        });
                                }
                            })
                            .then(mailObj => {
                                if (mailObj && mailObj.emails.length) {
                                    const data = {
                                        directory: company.directory,
                                        country: company.country,
                                        company_name: company.company_name,
                                        company_url: company.company_url,
                                        emails: mailObj.emails.reduce((value, mail) => {
                                            if (mail.confidence > 40) value.push(mail.value);
                                            return value;
                                        }, []),
                                        names: mailObj.emails.reduce((value, mail) => {
                                            if (mail.confidence > 40) value.push(mail.last_name ? mail.first_name + " " + mail.last_name : mail.first_name);
                                            return value;
                                        }, [])
                                    }
                                    const opts = {
                                        url: `${mongodbBaseUri}collections/companiesemails?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz`,
                                        method: "POST",
                                        data: JSON.stringify(data),
                                        contentType: "application/json"
                                    }
                                    return $.ajax(opts)
                                        .then(() => "success")
                                        .catch(err => err);
                                }
                            })
                            .catch(err => err);
                    })
                    .catch(err => err);
            }
        }))
            .then(() => {
                $.post(location.origin + '/notify/mail', {sub: location.search.substr(1).split('=')[1] + " Email extraction completed", msg: "Done extraction", to: "chppal50@gmail.com"})
                    .then(d => {
                        if (d === "success") {
                            alert(location.search.substr(1).split('=')[1].toUpperCase() + " Email extraction completed");
                        }
                    })
                    .catch(() => alert("Something nasty has happened"));
            });
    })
.catch(() => alert('Something very terrible happened while retrieving companies list. This need fixation immediately.'));