'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var printer = require('../../lib/printer');
var search = require('../../lib/search');
var utils = require('../../lib/utils');

var search_ = exports.search = function(queryString, callback) {
    var pointsForTitle =                6;
    var pointsForPreciseTitle =         pointsForTitle * 5;
    var pointsForText =                 1;
    var pointsForPreciseText =          pointsForText * 5;
    var pointsForTag =                  15;
    var pointsForView =                 0.05;

    var data = utils.trim(queryString).split(' ');

    var finalArticleList = [];
    return mongoose.model('Article').find({activated: true}).exec(function(err, articleList) {
        if (err)
            return callback(err);

        return async.eachSeries(articleList, function(article, articleCallback) {
            article.points = 0;
            article.pointDetail = {
                title: 0,
                text: 0,
                tags: 0,
                views: 0,
            };

            var dataCopy = data.slice(0);

            var tagGroupRegex = search.buildSearchRegExp(dataCopy.map(function(elem) {
                return utils.escapeRegExp(elem.trim());
            }));

            article.pointDetail.tags = 0;
            for (var j = 0 ; dataCopy.length > j ; ++j) {
                for (var i = 0 ; article.tags.length > i ; ++i) {
                    if (article.tags[i].match(new RegExp('(' + dataCopy[j] + ')', 'gi'))) {
                        article.points += pointsForTag;
                        article.pointDetail.tags += Math.round(pointsForTag);
                    }
                }
            }

            var tagSearch = new RegExp(tagGroupRegex, 'i');
            var titleMatch = article.title.match(tagSearch);
            var textMatch = article.text.match(tagSearch);
            article.points += (titleMatch ? titleMatch.length - 1 : 0) * pointsForTitle;
            article.pointDetail.title += (titleMatch ? titleMatch.length - 1 : 0) * pointsForTitle;
            article.points += (textMatch ? textMatch.length - 1 : 0) * pointsForText;
            article.pointDetail.text = (textMatch ? textMatch.length - 1 : 0) * pointsForText;

            var tagPreciseSearch = new RegExp('\\b' + tagGroupRegex + '\\b', 'i');
            var titlePreciseMatch = article.title.match(tagPreciseSearch);
            var textPreciseMatch = article.text.match(tagPreciseSearch);
            article.points += (titlePreciseMatch ? titlePreciseMatch.length - 1 : 0) * pointsForPreciseTitle;
            article.pointDetail.title += (titlePreciseMatch ? titlePreciseMatch.length - 1 : 0) * pointsForPreciseTitle;
            article.points += (textPreciseMatch ? textPreciseMatch.length - 1 : 0) * pointsForPreciseText;
            article.pointDetail.text += (textPreciseMatch ? textPreciseMatch.length - 1 : 0) * pointsForPreciseText;

            if (article.points) {
                article.points += (article.views * pointsForView || 0);
                article.pointDetail.views = article.views * pointsForView || 0;
            }

            if (article.points) {
                printer.debug('Article "' + article.title + '" has ' + article.points + ' points for search ' + queryString);
                finalArticleList.push({
                    title: article.title,
                    technicalName: article.technicalName,
                    text: article.compressedText,
                    tags: article.tags,
                    type: article.type,
                    created: article.created,
                    points: article.points,
                    pointDetail: article.pointDetail,
                });
            }
            return articleCallback();
        }, function(err) {
            if (err)
                return callback(err);

            finalArticleList.sort(function(a, b) { return b.points - a.points; });

            return callback(null, finalArticleList);
        });
    });
};

exports.page = function(req, res, callback) {
    res.locals.title = 'Search';

    res.locals.page = 'pages/search.html';
    res.locals.activeTopMenu = 'blog';

    // First, we get the actual page index
    // /!\ 0 means first page, 1 means second page; in front, 1 means first page and 2 means second page
    res.locals.actualPageIndex = (req.params.pageNumber && 0 < req.params.pageNumber) ? req.params.pageNumber - 1 : 0;

    if (!req.query.search)
        req.query.search = '';
    if (constants.searchStringMaxLength < req.query.search.length)
        req.query.search = req.query.search.substring(0, constants.searchStringMaxLength);

    // Do FULL search every time (should be optimized in the future)
    return search_(req.query.search || '', function(err, articles) {
        if (err) return callback(err);

        res.locals.totalPageCount = Math.ceil(articles.length / constants.frontSearchPageArticleCount);

        // Keep only a selected number of articles; this is done because
        // the front would have performance issues if there were too many
        // results
        res.locals.articleList = articles.slice(res.locals.actualPageIndex * constants.frontSearchPageArticleCount,
                                                res.locals.actualPageIndex * constants.frontSearchPageArticleCount + constants.frontSearchPageArticleCount);

        res.locals.searchString = req.query.search;

        return callback();
    });
};
