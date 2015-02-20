'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var markdown = require('../../lib/markdown');
var utils = require('../../lib/utils');

// Get page
exports.page = function(req, res, callback) {
    res.locals.title = 'Articles';

    res.locals.page = 'pages/articles/list.html';
    res.locals.toolbar = 'toolbar/default.html';
    res.locals.activeTopMenu = 'articles';

    return mongoose.model('Article').find().sort({created: -1}).exec(function(err, articles) {
        if (err) return callback(err);

        res.locals.articleList = articles;
        return callback();
    });
};

// Get edition page
exports.editPage = function(req, res, callback) {
    res.locals.page = 'pages/articles/edit.html';
    res.locals.toolbar = 'toolbar/articles/edit.html';
    res.locals.pageAndToolbarNgController = 'editArticleController';
    res.locals.activeTopMenu = 'articles';

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

// Get comment moderation page
exports.commentModerationPage = function(req, res, callback) {
    res.locals.title = 'Comments moderation';

    res.locals.page = 'pages/articles/comments.html';
    res.locals.toolbar = 'toolbar/default.html';
    res.locals.activeTopMenu = 'articles';

    return mongoose.model('Comment').update({article: req.params.articleId}, {$set: {'new': false}}, {multi: true}, function(err) {
        if (err) return callback(err);

    return mongoose.model('Comment').find({article: req.params.articleId}).sort({created: 1}).exec(function(err, comments) {
        if (err) return callback(err);

        res.locals.commentList = comments;
        return callback();
    });
    });
};

// Activate the article, i.e. make it visible in front
exports.activate = function(req, res, callback) {
    return mongoose.model('Article').findOneAndUpdate({_id: req.params.articleId}, {$set: {activated: true}}, function(err, updatedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!updatedArticle) return callback({code: 404, message: 'Article with ID "' + req.params.articleId + '" not found'});

        return callback();
    });
};

// Deactivate the article, i.e. make it invisible in front
exports.deactivate = function(req, res, callback) {
    return mongoose.model('Article').findOneAndUpdate({_id: req.params.articleId}, {$set: {activated: false}}, function(err, updatedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!updatedArticle) return callback({code: 404, message: 'Article with ID "' + req.params.articleId + '" not found'});

        return callback();
    });
};

// Save article; constraints should be made a bit better
exports.save = function(req, res, callback) {
    if (!req.body.title ||
        4 > req.body.title.length)
        return callback({code: 400, message: 'Title too short or missing'});
    if (!req.body.technicalName ||
        4 > req.body.technicalName.length)
        return callback({code: 400, message: 'Technical name too short or missing'});
    if (!req.body.tags ||
        2 > req.body.tags.length)
        return callback({code: 400, message: 'Too few or no tags'});
    if (!req.body.type)
        return callback({code: 400, message: 'Missing article type'});

    var findOptions = {
        _id: req.body._id || {$exists: false},
    };
    var updateOptions = {
        title: req.body.title,
        technicalName: req.body.technicalName,
        text: req.body.text,
        compressedText: markdown(req.body.text),
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

        return callback(null, {
            articleId: updatedArticle._id,
        });
    });
};

// Get featured article
exports.getFeatured = function(req, res, callback) {
    return mongoose.model('Article').findOne({featured: true}, function(err, featuredArticle) {
        if (err) return callback({code: 500, message: err});

        return callback(null, featuredArticle);
    });
};

// Set article as featured, de-featuring the previously featured article
exports.setFeatured = function(req, res, callback) {
    return mongoose.model('Article').findOneAndUpdate({featured: true}, {$set: {featured: false}}, function(err) {
        if (err) return callback({code: 500, message: err});

        return mongoose.model('Article').findOneAndUpdate({_id: req.params.articleId}, {$set: {featured: true}}, function(err) {
            if (err) return callback({code: 500, message: err});
            return callback();
        });
    });
};

// Delete the article altogether
exports.remove = function(req, res, callback) {
    return mongoose.model('Article').findOneAndRemove({_id: req.params.articleId}, function(err, deletedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!deletedArticle) return callback({code: 404, message: 'Article with ID "' + req.params.articleId + '" not found'});

        return callback();
    });
};

// Generate a technical name; should probably check in DB if technical name already exists
// but the article currently in edition can also be in DB
exports.generateTechnicalName = function(req, res, callback) {
    if (!req.query.title ||
       4 > req.query.title.length)
        return callback({code: 400, message: 'Title too short or missing'});

    var technicalName = req.query.title.replace(/ /g, '_')
        .toLowerCase()
        .replace(/[^a-z0-9\-_]/g, '');

    var findOptions = {
        _id: {
            $ne: req.query.id || null,
        },
        technicalName: technicalName,
    };

    return mongoose.model('Article').findOne(findOptions, function(err, article) {
        if (err) return callback({code: 500, message: err});
        if (article) return callback({code: 409, message: 'Technical name ' + technicalName + ' already exists'});

        return callback(null, technicalName);
    });
};

// Change comment visibility
exports.setCommentStatus = function(req, res, callback) {
    if (!req.body.status)
        return callback({code: 400, message: 'Missing status'});

    return mongoose.model('Comment').findOneAndUpdate({_id: req.params.commentId}, {$set: {status: req.body.status}}, function(err) {
        if (err) return callback({code: 500, message: err});

        return callback();
    });
};

// Delete comment altogether
exports.removeComment = function(req, res, callback) {
    return mongoose.model('Comment').findOneAndRemove({_id: req.params.commentId}, {$set: {status: req.body.status}}, function(err, removed) {
        if (err) return callback({code: 500, message: err});
        else if (!removed) return callback({code: 404, message: 'Comment not found'})

        return callback();
    });
};
