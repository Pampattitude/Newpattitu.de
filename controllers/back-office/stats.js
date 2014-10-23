'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Statistics';

    res.locals.page = 'pages/stats.html';
    res.locals.activeTopMenu = 'stats';

    return callback();
};
