'use strict';

var mongoose = require('mongoose');

var minInactivityTime = 7; //days
var lastTimeNotified = null;
var minNotificationRetryTime = 1; //days

module.exports = function(callback) {
    if (!lastTimeNotified) {
        lastTimeNotified = new Date();
        lastTimeNotified.setDate(lastTimeNotified.getDate() - (minNotificationRetryTime + 1));
    }

    var startInactivityTime = new Date();
    startInactivityTime.setDate(startInactivityTime.getDate() - minInactivityTime);

    return mongoose.model('Article').find({lastUpdated: {$gte: startInactivityTime}}).sort({lastUpdated: -1}).limit(1).exec(function(err, articles) {
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
