'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    console.log('BEF', JSON.stringify(res.locals, null, 2));
    res.locals.title = 'Statistics';

    res.locals.page = 'pages/stats.html';
    console.log('AFT', JSON.stringify(res.locals, null, 2));

    return callback();
};
