'use strict';

var mongoose = require('mongoose');

var printer = require('../../lib/printer');

exports.page = function(req, res, callback) {
    res.locals.title = 'Report';

    res.locals.page = 'pages/report.html';
    res.locals.hidePageMenu = true;

    return callback();
};

exports.send = function(req, res, callback) {
    if (!req.body.name ||
        4 > req.body.name.length)
        return callback({code: 400, message: 'Name too small or missing'});
    else if (32 < req.body.name.length)
        return callback({code: 400, message: 'Name too small or missing'});

    if (!req.body.text ||
        4 > req.body.text.length)
        return callback({code: 400, message: 'Report text too small or missing'});
    else if (1024 < req.body.text.length)
        return callback({code: 400, message: 'Report text too long'});

    var report = new (mongoose.model('Report'))({
        author: req.body.name,
        text: req.body.text,
        status: 'open',
    });

    return report.save(function(err) {
        if (err) {
            printer.error(err);
            return callback({code: 500, message: 'An unknown error occured while saving report'});
        }

        return callback();
    });
};
