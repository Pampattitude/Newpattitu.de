'use strict';

var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.page = 'pages/article.html';
    res.locals.activeTopMenu = 'blog';

    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName, activated: true}, function(err, article) {
        if (err) return callback(err);
        if (!article) return res.redirect('/404');

        res.locals.article = article;
        res.locals.title = article.title;

        ++article.views;
        return article.save(function(err) {
            if (err) return callback(err);

            res.locals.article.text = res.locals.article.compressedText;
            delete res.locals.article.compressedText;

            return mongoose.model('Comment').find({article: article._id}).sort({created: 1}).populate('user').exec(function(err, comments) {
                if (err) return callback(err);

                res.locals.commentList = comments;

                // Finally, set user if user is set
                if (req.session.user)
                    res.locals.user = req.session.user;

                return require('./search').search(article.tags.join(' '), function(err, related) {
                    if (err)
                        return callback(err);

                    res.locals.relatedArticles = [];
                    for (var i = 0 ; constants.frontRelatedArticleCount > res.locals.relatedArticles.length && related.length > i ; ++i) {
                        if (res.locals.article.technicalName === related[i].technicalName)
                            continue ;

                        res.locals.relatedArticles.push({
                            type: related[i].type,
                            title: related[i].title,
                            technicalName: related[i].technicalName,
                        });
                    }

                    return callback();
                });
            });
        });
    });
};

exports.permalinkPage = function(req, res, callback) {
    res.locals.page = 'pages/article.html';
    res.locals.activeTopMenu = 'blog';

    return mongoose.model('Article').findOne({_id: req.params.articleId, activated: true}, function(err, article) {
        if (err) return callback(err);
        if (!article) return res.redirect('/404');

        res.locals.article = article;
        res.locals.title = article.title;

        ++article.views;
        return article.save(function(err) {
            if (err) return callback(err);

            res.locals.article.text = res.locals.article.compressedText;
            delete res.locals.article.compressedText;

            return mongoose.model('Comment').find({article: article._id}).sort({created: 1}).populate('user').exec(function(err, comments) {
                if (err) return callback(err);

                res.locals.commentList = comments;

                // Finally, set user if user is set
                if (req.session.user)
                    res.locals.user = req.session.user;

                return require('./search').search(article.tags.join(' '), function(err, related) {
                    if (err)
                        return callback(err);

                    res.locals.relatedArticles = [];
                    for (var i = 0 ; constants.frontRelatedArticleCount > res.locals.relatedArticles.length && related.length > i ; ++i) {
                        if (res.locals.article.technicalName === related[i].technicalName)
                            continue ;

                        res.locals.relatedArticles.push({
                            type: related[i].type,
                            title: related[i].title,
                            technicalName: related[i].technicalName,
                        });
                    }

                    return callback();
                });
            });
        });
    });
};

exports.previewPage = function(req, res, callback) {
    res.locals.page = 'pages/article.html';
    res.locals.activeTopMenu = 'blog';
    res.locals.isPreview = true;

    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return res.redirect('/back-office/404');

        res.locals.article = article;
        res.locals.title = article.title + ' - Preview';
        return article.save(function(err) {
            if (err) return callback(err);

            res.locals.article.text = res.locals.article.compressedText;
            delete res.locals.article.compressedText;

            // Finally, set user if user is set
            if (req.session.user)
                res.locals.user = req.session.user;
            res.locals.deactivateComments = true;

            return callback();
        });
    });
};
