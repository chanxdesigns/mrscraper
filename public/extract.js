const db_name = 'heroku_5lpx8nq1';
const mongodbBaseUri = `https://api.mlab.com/api/1/databases/`;

var hunter = {
    /** Mongo URI **/
    mongoUri: mongodbBaseUri + `${db_name}/collections/apikeys`,

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
                        if (user.data.calls.used > user.data.calls.available) {
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
    const uri = mongodbBaseUri + `${db_name}/collections/companies?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"directory":dir[0].toUpperCase()+dir.substr(1)})}&l=20`;
    return $.get(uri);
}

function checkForAvailability (company,dir) {
    const uri = mongodbBaseUri + `${db_name}/collections/companiesemails?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"directory":dir[0].toUpperCase()+dir.substr(1), "company_url":company.company_url})}&fo=true`;
    return $.get(uri);
}

getCompanies('esomar')
    .then(companies => {
        "use strict";
        Promise.all(companies.map(company => {
            return hunter.getHunterApiKeys()
                .then(api => {
                    return checkForAvailability(company,'esomar')
                        .then(data => {
                            if (!data) {
                                const uri = `https://api.hunter.io/v2/domain-search?domain=${company.company_url}&api_key=${api.key}`;
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
                            if (mailObj === undefined) {
                                console.log("Yes It Is");
                            }
                        });
                })
                .catch(err => err);
        }))
            .then(d => console.log(d));
    })
// function recursiveExtractMail (company, api) {
//     "use strict";
//     return checkForAvailability(company,'esomar')
//         .then(data => {
//             if (!data) {
//                 const uri = `https://api.hunter.io/v2/domain-search?domain=${company.company_url}&api_key=${api.key}`;
//                 return $.get(uri)
//                     .then(
//                         mailObj => {
//                             if (mailObj) {
//                                 return mailObj
//                             }
//                         }
//                     )
//                     .catch(d => {
//                         if (d.responseJSON.errors) {
//                             hunter.getHunterApiKeys()
//                                 .then()
//                         }
//                     });
//             }
//         })
// }
//
// function getRecursiveEmails (company, api, usage) {
//     "use strict";
//     if (!usage) {
//         return hunter.setHunterApiKeys(api)
//             .then(() => {
//                 return hunter.getHunterApiKeys()
//                     .then(api => {
//                         const uri = `https://api.hunter.io/v2/domain-search?domain=${company.company_url}&api_key=${api.key}`;
//                         return $.get(uri)
//                             .then(
//                                 mailObj => {
//                                     if (mailObj) {
//                                         return mailObj
//                                     }
//                                 }
//                             )
//                             .catch(err => {
//                                 if (err.responseJSON.errors) {
//                                     return getRecursiveEmails(company,api,false);
//                                 }
//                             })
//                     })
//             })
//             .catch()
//     }
//     return hunter.getHunterApiKeys()
//         .then(api => {
//             const uri = `https://api.hunter.io/v2/domain-search?domain=${company.company_url}&api_key=${api.key}`;
//             return $.get(uri)
//                 .then(
//                     mailObj => {
//                         if (mailObj) {
//                             return mailObj
//                         }
//                     }
//                 )
//                 .catch(err => {
//                     if (err.responseJSON.errors) {
//                         return getRecursiveEmails(company,api,false);
//                     }
//                 })
//         })
// }

