'use strict';

var async = require('async');
var printer = require('../lib/printer');

var errorSleepTime = 60 * 60 * 1000; //ms, so every hour
var spinSleepTime = 10 * 60 * 1000; //ms, so every 10 minutes

module.exports = function(unusedCallback) {
    return async.whilst(function() { return true; }, function(whilstCallback) {
        printer.info('Starting daemons...');

        var daemons = require('require-dir')(__dirname + '/daemons');
        return async.each(Object.keys(daemons), function(daemonKey, daemonCallback) {
            printer.info('Starting daemon "' + daemonKey + '"...');

            return daemons[daemonKey](function(err) {
                if (err) return daemonCallback(err);
                printer.info('Daemon "' + daemonKey + '" ended');

                return daemonCallback();
            });
        }, function(err) {
            if (err)
                return require('../lib/mail').sendDaemonError(err, function(err) {
                    if (err) return whilstCallback(err);
                    printer.info('Daemons ended');
                    return setTimeout(whilstCallback, errorSleepTime);
                });

            printer.info('Daemons ended');
            return setTimeout(whilstCallback, spinSleepTime);
        });
    }, unusedCallback);
};
