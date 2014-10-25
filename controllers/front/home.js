'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Blog';

    res.locals.page = 'pages/home.html';
    res.locals.activeTopMenu = 'blog';

    res.locals.actualPageIndex = (req.params.pageNumber && 0 < req.params.pageNumber) ? req.params.pageNumber - 1 : 0;

    return async.series([
        function(serieCallback) {
            return mongoose.model('Article').count(function(err, articleCount) {
                if (err) return serieCallback(err);

                res.locals.totalPageCount = Math.ceil(articleCount / constants.frontHomePageArticleCount);
                return serieCallback();
            });
        },
        function(serieCallback) { // Get featured article
            // Skip featured article if page > 0
            if (0 != res.locals.actualPageIndex)
                return serieCallback();

            return mongoose.model('Article').findOne({featured: true, activated: true}, function(err, featuredArticle) {
                if (err) return serieCallback(err);
                if (featuredArticle)
                    res.locals.featuredArticle = featuredArticle;

                return serieCallback();
            });
        },
        function(serieCallback) { // Get article list
            var articleCountToSkip = res.locals.actualPageIndex * constants.frontHomePageArticleCount; // Page count starts at 1 for the user

            return mongoose.model('Article').find({featured: false, activated: true}).sort({created: -1}).skip(articleCountToSkip).limit(constants.frontHomePageArticleCount).exec(function(err, articles) {
                if (err)
                    return callback(err);

                res.locals.articleList = articles;

                if (res.locals.featuredArticle)
                    res.locals.articleList.unshift(res.locals.featuredArticle);

                res.locals.articleList.forEach(function(elem) {
                    elem.caption = elem.compressedCaption;
                    delete elem.compressedCaption;

                    elem.text = elem.compressedText;
                    delete elem.compressedText;
                });

                return callback();
            });
        },
    ], callback);
};
