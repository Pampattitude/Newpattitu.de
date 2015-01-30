'use strict';

var mongoose = require('mongoose');

var minInactivityTime = 7; //days
var minNotificationRetryTime = 1; //days
var lastTimeNotified = new Date();
lastTimeNotified.setDate(lastTimeNotified.getDate() - (minNotificationRetryTime + 1));

module.exports = function(callback) {
    var startInactivityTime = new Date();
    startInactivityTime.setDate(startInactivityTime.getDate() - minInactivityTime);

    return mongoose.model('Article').find({lastUpdated: {$gte: startInactivityTime}}).exec(function(err, articles) {
        if (err) return callback(err);
        if (!articles.length) { // Maybe notify
            var nextNotificationMinTime = lastTimeNotified;
            nextNotificationMinTime.setDate(nextNotificationMinTime.getDate() + minNotificationRetryTime);

            if (nextNotificationMinTime < new Date()) {
                lastTimeNotified = new Date();
                printer.warn('Sending mail to administrator about inactivity');
                return require('../../lib/mail').sendInactiveMail(callback);
            }
        }

        return callback();
    });
};
