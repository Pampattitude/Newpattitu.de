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
        function(serieCallback) { // Get article list
            var articleCountToSkip = res.locals.actualPageIndex * constants.frontBlogPageArticleCount; // Page count starts at 1 for the user

            return mongoose.model('Article').find({activated: true}).sort({created: -1}).skip(articleCountToSkip).limit(constants.frontBlogPageArticleCount).exec(function(err, articles) {
                if (err)
                    return serieCallback(err);

                res.locals.articleList = articles;

                // Finally, do not expose non-compressed text (for size)
                res.locals.articleList.forEach(function(elem) {
                    elem.text = elem.compressedText;
                    delete elem.compressedText;
                });

                return serieCallback();
            });
        },
    ], callback);
};
