'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.getComments = function(req, res, callback) {
    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return callback(null, '/404');

        return mongoose.model('Comment').find({article: article._id}).sort({created: 1}).exec(function(err, comments) {
            if (err) return callback(err);

            return callback(null, {
                commentList: comments,
            });
        });
    });
};

exports.postComment = function(req, res, callback) {
    if (!req.body.author ||
        2 >= req.body.author.length)
        return callback(null, {code: 400, message: 'Name too short'});

    if (!req.body.text ||
        10 >= req.body.text.length)
        return callback(null, {code: 400, message: 'Comment content too short'});

    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return callback(null, '/404');

        var comment = new (mongoose.model('Comment'))({
            article: article._id,

            author: req.body.author,
            text: req.body.text,
        });

        return comment.save(function(err) {
            if (err) return callback(err);

            return callback(null);
        });
    });
};
