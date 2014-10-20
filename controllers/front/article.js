'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.page = 'pages/article.html';
    res.locals.activeTopMenu = 'blog';

    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return res.redirect('/404');

        res.locals.article = article;
        res.locals.title = article.title;

        ++article.views;
        return article.save(function(err) {
            if (err) return callback(err);

            return mongoose.model('Comment').find({article: article._id}).sort({created: 1}).populate('user').exec(function(err, comments) {
                if (err) return callback(err);

                res.locals.commentList = comments;

                // Finally, set user if user is set
                if (req.session.user)
                    res.locals.user = req.session.user;

                return callback();
            });
        });
    });
};
