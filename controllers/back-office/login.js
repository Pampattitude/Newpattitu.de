'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Login';

    res.locals.page = 'pages/login.html';
    res.locals.toolbar = 'toolbar/default.html';

    return callback();
};

exports.ajaxLogin = function(req, res, callback) {
    if (!req.body.username ||
        !req.body.password) {
        if (!res.locals.alertList)
            res.locals.alertList = [];

        res.locals.alertList.push({state: 'error', message: 'Missing username or password'});
        return callback({
            code: 403,
            message: 'Missing username or password',
        });
    }

    var generatedPassword = mongoose.model('User').generatePassword(req.body.password);

    return mongoose.model('User').findOne({
        username: req.body.username,
        password: generatedPassword,
    }, function(err, user) {
        if (err) return callback({code: 500, message: err});
        if (!user) return callback({
            code: 404,
            message: 'Wrong username or password',
        });

        req.session.user = user;

        return callback(null, user);
    });
};

exports.ajaxLogout = function(req, res, callback) {
    delete req.session.user;
    return callback();
};
