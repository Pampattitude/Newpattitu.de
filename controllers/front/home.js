'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Home';

    res.locals.page = 'pages/home.html';
    res.locals.activeTopMenu = 'home';

    return async.series([
        function(serieCallback) { // Get featured article
            return mongoose.model('Article').findOne({featured: true}, function(err, featuredArticle) {
                if (err) return serieCallback(err);
                if (featuredArticle)
                    res.locals.featuredArticle = featuredArticle;

                return serieCallback();
            });
        },
        function(serieCallback) { // Get article list
            return mongoose.model('Article').find().sort({created: -1}).limit(constants.frontHomePageArticleCount).exec(function(err, articles) {
                if (err)
                    return callback(err);

                res.locals.articleList = articles.filter(function(elem) {
                    if (res.locals.featuredArticle) {
                        if (res.locals.featuredArticle.technicalName == elem.technicalName)
                            return false;
                    }
                    return true;
                });

                if (res.locals.featuredArticle)
                    res.locals.articleList.unshift(res.locals.featuredArticle);

                return callback();
            });
        },
    ], callback);
};
