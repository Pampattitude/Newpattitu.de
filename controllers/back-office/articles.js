'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Articles';

    res.locals.page = 'pages/articles/list.html';

    return mongoose.model('Article').find().sort({created: -1}).exec(function(err, articles) {
        if (err) return callback(err);

        res.locals.articleList = articles;
        return callback();
    });
};

exports.editPage = function(req, res, callback) {
    res.locals.page = 'pages/articles/edit.html';

    if (!req.params.technicalName) {
        res.locals.title = 'Create article';
        return callback();
    }

    return mongoose.model('Article').findOne({technicalName: req.params.technicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return callback(new Error('Could not find article with technical name "' + req.params.technicalName + '"'));

        res.locals.title = article.title + ' - Edit';
        res.locals.article = article;

        return callback();
    });
};

exports.activate = function(req, res, callback) {
    return mongoose.model('Article').findOneAndUpdate({technicalName: req.params.technicalName}, {$set: {activated: true}}, function(err, updatedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!updatedArticle) return callback({code: 404, message: 'Article with technical name "' + req.params.technicalName + '" not found'});

        return callback();
    });
};

exports.deactivate = function(req, res, callback) {
    return mongoose.model('Article').findOneAndUpdate({technicalName: req.params.technicalName}, {$set: {activated: false}}, function(err, updatedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!updatedArticle) return callback({code: 404, message: 'Article with technical name "' + req.params.technicalName + '" not found'});

        return callback();
    });
};

exports.remove = function(req, res, callback) {
    return mongoose.model('Article').findOneAndRemove({technicalName: req.params.technicalName}, function(err, deletedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!deletedArticle) return callback({code: 404, message: 'Article with technical name "' + req.params.technicalName + '" not found'});

        return callback();
    });
};
