const db_name = 'heroku_5lpx8nq1';
const mongodbBaseUri = `https://api.mlab.com/api/1/databases/`;

var hunter = {
    /** Mongo URI **/
    mongoUri: mongodbBaseUri + `${db_name}/collections/apikeys`,

    /**
     * Get Hunter Api Keys where usage {true}
     * @returns {Promise|Promise.<T>}
     */
    getHunterApiKeys:  () => {
        "use strict";
        const uri = hunter.mongoUri + `?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"usage":true})}&fo=true`;
        console.log(uri);
        return $.when($.get(uri))
            .then(api => api, err => err.message);
    },

    /**
     * Update exhausted hunter keys usage to {false}
     * @param api
     * @returns {Promise|Promise.<T>}
     */
    // setHunterApiKeys: (api) => {
    //     "use strict";
    //     const opts = {
    //         uri: hunter.mongoUri + `/${api._id}`,
    //         method: 'PUT',
    //         body: {usage: false},
    //         json: true,
    //         qs: {
    //             apiKey: process.env.MONGO_APIKEY || 'rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz'
    //         }
    //     }
    //     return request(opts)
    //         .then(() => {
    //             return 1
    //         })
    //         .catch(err => err.message);
    // }
}

function getCompanies (dir) {
    "use strict";
    const uri = mongodbBaseUri + `${db_name}/collections/companies?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"directory":dir[0].toUpperCase()+dir.substr(1)})}&l=0`;
    console.log(uri);
    return $.when($.get(uri))
        .then(data => data, err => err.message);
}

function checkForAvailability (company,dir) {
    const uri = mongodbBaseUri + `${db_name}/collections/companiesemails?apiKey=rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz&q=${JSON.stringify({"directory":dir[0].toUpperCase()+dir.substr(1), "company_url":company.company_url})}&fo=true`;
    return $.when($.get(uri));
}
getCompanies('esomar')
    .then(companies => {
        "use strict";
        hunter.getHunterApiKeys()
            .done(api => {
                return companies.map(company => {
                    return checkForAvailability(company,'esomar')
                        .then(data => {
                            if (!data) return "Yes";
                        })
                    //const uri = `https://api.hunter.io/v2/domain-search?domain=${company.company_url}&api_key=${api.key}`;
                })
            })
            .done(data => {
                Promise.all(data)
                    .then(data => console.log(data));
            })
    },
    err => alert(err.message)
    );

// module.exports = function getEmails(dir) {
//     return getCompanies(dir)
//         .then(companies => {
//             "use strict";
//             return hunter.getHunterApiKeys()
//                 .then(apikeys => {
//                     return JSON.parse(apikeys);
//                 })
//                 .then(api => {
//                     console.log(api)
//                     return JSON.parse(companies).map(company => {
//                         const opts = {
//                             uri: 'https://api.hunter.io/v2/domain-search',
//                             qs: {
//                                 domain: company.company_url,
//                                 api_key: api.key
//                             },
//                             timeout: 300000
//                         }
//                         return request(opts)
//                             .then(mailObj => {
//                                 console.log('Nope');
//                                 return "nopne man";
//                             })
//                             .catch(err => {
//                                 return err;
//                             })
//                     })
//                 })
//                 .then(mailObjsPromise => {
//                     return Promise.all(mailObjsPromise)
//                         .then(datas => datas);
//                 })
//                 .catch(err => err.message);
//         })
//         .catch(err => err.message);
// }