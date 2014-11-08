'use strict';

var request = require('request');

var printer = require('../lib/printer');

function statsClient(host) {
    this.host = host;

    // Required: collectionName
    // Should add:
    //   params.grain: in ['day', 'week', 'month', 'year']
    //   for 'day'      -> params.day, params.month, params.year
    //   for 'week'     -> params.week, params.year
    //   for 'month'    -> params.month, params.year
    //   for 'year'     -> params.year
    this.get = function(collectionName, params, callback) {
        var client = this;

        if (undefined == callback)
            callback = function() {}; // Do nothing

        var reqOptions = {
            uri: client.host + '/stat/' + collectionName,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        };

        return request.get(reqOptions, function(err, results) {
            if (err)
                return callback(err);

            return callback(null, JSON.parse(results.body));
        });
    };

    this.post = function(collectionName, params, skipError, callback) {
        var client = this;

        if (undefined == skipError)
            skipError = true;
        if (undefined == callback)
            callback = function() {}; // Do nothing

        var reqOptions = {
            uri: client.host + '/stat/' + collectionName,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        };

        return request.post(reqOptions, function(err) {
            if (err) {
                if (skipError) { // Do not move error up the callback
                    printer.warn(err);
                    return callback();
                }

                return callback(err);
            }

            return callback();
        });
    };

    return this;
};

module.exports = exports = new statsClient('http://localhost:8338');
