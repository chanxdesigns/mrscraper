const request = require('request-promise');
const db_name = 'heroku_9rb65rmg';
const mongodbUri = `https://api.mlab.com/api/1/databases/`;
// const long = require('longjohn');

var hunter = {
    /** Mongo URI **/
    mongoUri: mongodbUri + `${db_name}/collections/apikeys`,

    /**
     * Get Hunter Api Keys where usage {true}
     * @returns {Promise|Promise.<T>}
     */
    getHunterApiKeys:  () => {
        "use strict";
        const opts = {
            uri: hunter.mongoUri,
            qs: {
                apiKey: process.env.MONGO_APIKEY || 'rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz',
                q: JSON.stringify({"usage":true}),
                fo: true
            },
            timeout: 300000
        }
        return request(opts)
            .then(api => {
                return api;
            })
            .catch(err => err.message);
    },

    /**
     * Update exhausted hunter keys usage to {false}
     * @param api
     * @returns {Promise|Promise.<T>}
     */
    setHunterApiKeys: (api) => {
        "use strict";
        const opts = {
            uri: hunter.mongoUri + `/${api._id}`,
            method: 'PUT',
            body: {usage: false},
            json: true,
            qs: {
                apiKey: process.env.MONGO_APIKEY || 'rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz'
            }
        }
        return request(opts)
            .then(() => {
                return 1
            })
            .catch(err => err.message);
    }
}

function getCompanies (dir) {
    "use strict";
    const collection = 'companies';
    const opts = {
        uri: mongodbUri + `${db_name}/collections/${collection}`,
        qs: {
            apiKey: process.env.MONGO_APIKEY || 'rVegcqX22bCHAZzgfkhnrs9r6Nsbqlvz',
            q: JSON.stringify({"directory":dir[0].toUpperCase()+dir.substr(1)}),
            l: 0
        },
        timeout: 300000
    }
    return request(opts)
        .then(data => data)
        .catch(err => err.message);
}

module.exports = function getEmails(dir) {
    return getCompanies(dir)
        .then(companies => {
            "use strict";
            return hunter.getHunterApiKeys()
                .then(apikeys => {
                    return JSON.parse(apikeys);
                })
                .then(api => {
                    console.log(api)
                    return JSON.parse(companies).map(company => {
                        const opts = {
                            uri: 'https://api.hunter.io/v2/domain-search',
                            qs: {
                                domain: company.company_url,
                                api_key: api.key
                            },
                            timeout: 300000
                        }
                        return request(opts)
                            .then(mailObj => {
                                console.log('Nope');
                                return "nopne man";
                            })
                            .catch(err => {
                                return err;
                            })
                    })
                })
                .then(mailObjsPromise => {
                    return Promise.all(mailObjsPromise)
                        .then(datas => datas);
                })
                .catch(err => err.message);
        })
        .catch(err => err.message);
}