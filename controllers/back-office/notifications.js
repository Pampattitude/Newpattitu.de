'use strict';

var mongoose = require('mongoose');

exports.newComments = function(req, res, callback) {
    return mongoose.model('Comment').find({'new': true}).populate('article').exec(function(err, newComments) {
        if (err) return callback({code: 500, message: err});

        return callback(null, newComments);
    });
};

exports.newReports = function(req, res, callback) {
    return mongoose.model('Report').find({'new': true}).exec(function(err, newReports) {
        if (err) return callback({code: 500, message: err});

        return callback(null, newReports);
    });
};
