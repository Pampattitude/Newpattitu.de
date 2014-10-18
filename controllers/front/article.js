'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Blog';

    res.locals.page = 'pages/article.html';
    res.locals.activeTopMenu = 'blog';

    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return res.redirect('/404');

        res.locals.article = article;

        ++article.views;
        return article.save(function(err) {
            if (err) return callback(err);

            return mongoose.model('Comment').find({article: article._id}).sort({created: 1}).exec(function(err, comments) {
                if (err) return callback(err);

                res.locals.commentList = comments;

                return callback();
            });
        });
    });
};

exports.postComment = function(req, res, callback) {
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

            return callback(null, '/article/' + article.technicalName + '#pmp-comments');
        });
    });
};
