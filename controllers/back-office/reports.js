'use strict';

var mongoose = require('mongoose');

// Get page
exports.page = function(req, res, callback) {
    res.locals.title = 'Reports';

    res.locals.page = 'pages/reports.html'
    res.locals.activeTopMenu = 'reports';

    return mongoose.model('Report').find().sort({created: 1}).exec(function(err, reports) {
        if (err) return callback(err);

        res.locals.reportList = reports;

        return callback();
    });
};

// Change the status of the report
exports.setStatus = function(req, res, callback) {
    if (!req.body.status)
        return callback({code: 400, message: 'Missing status'});

    return mongoose.model('Report').findOneAndUpdate({_id: req.params.reportId}, {$set: {status: req.body.status}}, function(err) {
        if (err) return callback({code: 500, message: err});

        return callback();
    });
};

// Remove the report altogether (will be entirely removed from DB)
exports.remove = function(req, res, callback) {
    return mongoose.model('Report').findOneAndRemove({_id: req.params.reportId}, {$set: {status: req.body.status}}, function(err, removed) {
        if (err) return callback({code: 500, message: err});
        else if (!removed) return callback({code: 404, message: 'Report not found'})

        return callback();
    });
};
