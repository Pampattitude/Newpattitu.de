'use strict';

var async = require('async');
var mongoose = require('mongoose');

exports.isLoggedIn = function(req, res, next) {
    if (!req.session || !req.session.user)
        return res.redirect('/back-office/login');

    res.locals.logged = true;
    return next();
};

exports.getNotifications = function(req, res, next) {
    res.locals.notifications = {};

    return async.series([
        function(serieCallback) {
            return mongoose.model('Comment').find({'new': true}, function(err, newComments) {
                if (err) return serieCallback(err);

                res.locals.notifications.newComments = newComments;
                return serieCallback();
            });
        },
        function(serieCallback) {
            return mongoose.model('Report').find({'new': true}, function(err, newReports) {
                if (err) return serieCallback(err);

                res.locals.notifications.newReports = newReports;
                return serieCallback();
            });
        },
    ], function(err) {
        if (err) {
            printer.error(err);
            return res.redirect('/500');
        }

        return next();
    });
};
