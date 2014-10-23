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

    if (!req.params.articleId) {
        res.locals.title = 'Create article';
        return callback();
    }

    return mongoose.model('Article').findOne({_id: req.params.articleId}, function(err, article) {
        if (err) return callback(err);
        if (!article) return callback(new Error('Could not find article with ID "' + req.params.articleId + '"'));

        res.locals.title = article.title + ' - Edit';
        res.locals.article = article;

        return callback();
    });
};

exports.activate = function(req, res, callback) {
    return mongoose.model('Article').findOneAndUpdate({_id: req.params.articleId}, {$set: {activated: true}}, function(err, updatedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!updatedArticle) return callback({code: 404, message: 'Article with ID "' + req.params.articleId + '" not found'});

        return callback();
    });
};

exports.deactivate = function(req, res, callback) {
    return mongoose.model('Article').findOneAndUpdate({_id: req.params.articleId}, {$set: {activated: false}}, function(err, updatedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!updatedArticle) return callback({code: 404, message: 'Article with ID "' + req.params.articleId + '" not found'});

        return callback();
    });
};

exports.save = function(req, res, callback) {
    if (!req.body.title ||
        4 > req.body.title.length)
        return callback({code: 400, message: 'Title too short or missing'});
    if (!req.body.technicalName ||
        4 > req.body.technicalName.length)
        return callback({code: 400, message: 'Technical name too short or missing'});
    if (!req.body.caption ||
        32 > req.body.caption.length)
        return callback({code: 400, message: 'Caption too short or missing'});
    if (!req.body.text ||
        32 > req.body.text.length)
        return callback({code: 400, message: 'Text too short or missing'});
    if (!req.body.tags ||
        2 > req.body.tags.length)
        return callback({code: 400, message: 'Too few or no tags'});
    if (!req.body.type)
        return callback({code: 400, message: 'Missing article type'});

    var findOptions = {};
    if (req.body._id)
        findOptions._id = req.body._id;

    var updateOptions = {
        title: req.body.title,
        technicalName: req.body.technicalName,
        caption: req.body.caption,
        text: req.body.text,
        tags: req.body.tags,
        type: req.body.type,
        lastUpdated: new Date(),
    };
    var onInsertOptions = {
        featured: false,
        activated: false,
        views: 0,
        created: new Date(),
    };

    return mongoose.model('Article').findOneAndUpdate(findOptions, {$set: updateOptions, $setOnInsert: onInsertOptions}, {upsert: true}, function(err, updatedArticle) {
        if (err) return callback({code: 500, message: err});

        return callback();
    });
};

exports.remove = function(req, res, callback) {
    return mongoose.model('Article').findOneAndRemove({_id: req.params.articleId}, function(err, deletedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!deletedArticle) return callback({code: 404, message: 'Article with ID "' + req.params.articleId + '" not found'});

        return callback();
    });
};

exports.generateTechnicalName = function(req, res, callback) {
    if (!req.query.title ||
       4 > req.query.title.length)
        return callback({code: 400, message: 'Title too short or missing'});

    var technicalName = req.query.title.replace(/ /g, '_')
        .replace(/[^A-Za-z0-9\-_]/g, '')
        .toLowerCase();

    return callback(null, technicalName);
};
