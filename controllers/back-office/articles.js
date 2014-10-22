'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Articles';

    res.locals.page = 'pages/articles.html';

    return mongoose.model('Article').find().sort({created: -1}).exec(function(err, articles) {
        if (err) return callback(err);

        res.locals.articleList = articles;
        return callback();
    });
};

exports.activate = function(req, res, callback) {
    return mongoose.model('Article').update({technicalName: req.params.technicalName}, {$set: {activated: true}}, function(err, updatedCount) {
        if (err) return callback({code: 500, message: err});
        if (!updatedCount) return callback({code: 404, message: 'Article with technical name "' + req.params.technicalName + '" not found'});

        return callback();
    });
};

exports.deactivate = function(req, res, callback) {
    return mongoose.model('Article').update({technicalName: req.params.technicalName}, {$set: {activated: false}}, function(err, updatedCount) {
        if (err) return callback({code: 500, message: err});
        if (!updatedCount) return callback({code: 404, message: 'Article with technical name "' + req.params.technicalName + '" not found'});

        return callback();
    });
};
