'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Blog';

    res.locals.page = 'pages/blog.html';
    res.locals.activeTopMenu = 'blog';

    // First, we get the actual page index
    // /!\ 0 means first page, 1 means second page; in front, 1 means first page and 2 means second page
    res.locals.actualPageIndex = (req.params.pageNumber && 0 < req.params.pageNumber) ? req.params.pageNumber - 1 : 0;

    return async.series([
        function(serieCallback) {
            return mongoose.model('Article').count({activated: true}, function(err, articleCount) {
                if (err) return serieCallback(err);

                // We get the total page count to display
                res.locals.totalPageCount = Math.ceil(articleCount / constants.frontBlogPageArticleCount);

                return serieCallback();
            });
        },
        function(serieCallback) { // Get featured article
            // Skip featured article if page > 0
            // because there is no need to have the featured article at every page
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
            var articleCountToSkip = res.locals.actualPageIndex * constants.frontBlogPageArticleCount; // Page count starts at 1 for the user

            return mongoose.model('Article').find({activated: true}).sort({created: -1}).skip(articleCountToSkip).limit(constants.frontBlogPageArticleCount).exec(function(err, articles) {
                if (err)
                    return callback(err);

                res.locals.articleList = articles;

                // Remove featured articles manually, else it collides with the article page count calculation
                // (but means one page will have one less article...)
                res.locals.articleList = res.locals.articleList.filter(function(elem) {
                    if (elem.featured)
                        return false;
                    return true;
                });

                // Add featured article at front
                if (res.locals.featuredArticle)
                    res.locals.articleList.unshift(res.locals.featuredArticle);

                // Finally, do not expose non-compressed text (for size)
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
