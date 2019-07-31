'use strict';

const request = require('request-promise');


const globalCache = {} // default in-memory cache for downloaded certificates;

module.exports = async function fetchCert(options, callback) {
    const url = options.url;
    const cache = options.cache || globalCache;
    const cachedResponse = cache[url.href];
    const servedFromCache = false;

    if (cachedResponse) {
        servedFromCache = true;
        process.nextTick(callback, undefined, cachedResponse, servedFromCache);
        return;
    }

    try {
        /**
         * Use the request-promise library
         * to fetch the certificate, since
         * this library honors the HTTP(S)_PROXY
         * env variables
         */
        const response = await request(url, {
            json: true,
            resolveWithFullResponse: true
        });

        if (!response || 200 !== response.statusCode) {
            statusCode = response ? response.statusCode : 0;
            return callback('Failed to download certificate at: ' + url.href + '. Response code: ' + statusCode);
        }

        const body = response.body;

        cache[url.href] = body;
        callback(undefined, body, servedFromCache);

    } catch (err) {
        callback('Failed to download certificate at: ' + url.href + '. Error: ' + err);
    }
}