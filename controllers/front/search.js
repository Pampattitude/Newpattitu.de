'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var printer = require('../../lib/printer');
var utils = require('../../lib/utils');

exports.page = function(req, res, callback) {
    res.locals.title = 'Search';

    res.locals.page = 'pages/search.html';
    res.locals.activeTopMenu = 'blog';

    res.locals.actualPageIndex = (req.params.pageNumber && 0 < req.params.pageNumber) ? req.params.pageNumber - 1 : 0;

    if (!req.query.search)
        req.query.search = '';
    if (constants.searchStringMaxLength < req.query.search.length)
        req.query.search = req.query.search.substring(0, constants.searchStringMaxLength);

    return search_(req.query.search || '', function(err, articles) {
        if (err) return callback(err);

        res.locals.totalPageCount = Math.ceil(articles.length / constants.frontSearchPageArticleCount);
        res.locals.articleList = articles.slice(res.locals.actualPageIndex * constants.frontSearchPageArticleCount,
                                                res.locals.actualPageIndex * constants.frontSearchPageArticleCount + constants.frontSearchPageArticleCount);

        res.locals.searchString = req.query.search;

        return callback();
    });
};

var search_ = function(queryString, callback) {
    var pointsForTitle =                6;
    var pointsForPreciseTitle =         pointsForTitle * 5;
    var pointsForCaption =              2;
    var pointsForPreciseCaption =       pointsForCaption * 5;
    var pointsForText =                 1;
    var pointsForPreciseText =          pointsForText * 5;
    var pointsForTag =                  15;
    var pointsForFeatured =             10; //%
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
                caption: 0,
                text: 0,
                tags: 0,
                views: 0,
                featured: 0,
            };

            var dataCopy = data.slice(0);

            var tagGroupRegex = '(';

            article.pointDetail.tags = 0;
            for (var j = 0 ; dataCopy.length > j ; ++j) {
                dataCopy[j] = utils.escapeRegExp(dataCopy[j].trim());

                tagGroupRegex += dataCopy[j];
                if (dataCopy.length > j + 1)
                    tagGroupRegex += '|';

                for (var i = 0 ; article.tags.length > i ; ++i) {
                    if (article.tags[i].match(new RegExp('(' + dataCopy[j] + ')', 'gi'))) {
                        article.points += pointsForTag;
                        article.pointDetail.tags += Math.round(pointsForTag);
                    }
                }
            }
            tagGroupRegex += ')+?';

            var tagSearch = new RegExp(tagGroupRegex, 'i');
            var titleMatch = article.title.match(tagSearch);
            var captionMatch = article.caption.match(tagSearch);
            var textMatch = article.text.match(tagSearch);
            article.points += (titleMatch ? titleMatch.length - 1 : 0) * pointsForTitle;
            article.pointDetail.title += (titleMatch ? titleMatch.length - 1 : 0) * pointsForTitle;
            article.points += (captionMatch ? captionMatch.length - 1 : 0) * pointsForCaption;
            article.pointDetail.caption += (captionMatch ? captionMatch.length - 1 : 0) * pointsForCaption;
            article.points += (textMatch ? textMatch.length - 1 : 0) * pointsForText;
            article.pointDetail.text = (textMatch ? textMatch.length - 1 : 0) * pointsForText;

            var tagPreciseSearch = new RegExp('\\b' + tagGroupRegex + '\\b', 'i');
            var titlePreciseMatch = article.title.match(tagPreciseSearch);
            var captionPreciseMatch = article.caption.match(tagPreciseSearch);
            var textPreciseMatch = article.text.match(tagPreciseSearch);
            article.points += (titlePreciseMatch ? titlePreciseMatch.length - 1 : 0) * pointsForPreciseTitle;
            article.pointDetail.title += (titlePreciseMatch ? titlePreciseMatch.length - 1 : 0) * pointsForPreciseTitle;
            article.points += (captionPreciseMatch ? captionPreciseMatch.length - 1 : 0) * pointsForPreciseCaption;
            article.pointDetail.caption += (captionPreciseMatch ? captionPreciseMatch.length - 1 : 0) * pointsForPreciseCaption;
            article.points += (textPreciseMatch ? textPreciseMatch.length - 1 : 0) * pointsForPreciseText;
            article.pointDetail.text += (textPreciseMatch ? textPreciseMatch.length - 1 : 0) * pointsForPreciseText;

            if (article.points) {
                article.points += (article.views * pointsForView || 0);
                article.pointDetail.views = article.views * pointsForView || 0;

                if (article.featured) {
                    article.pointDetail.featured = article.points * pointsForFeatured / 100;
                    article.points += article.points * pointsForFeatured / 100;
                }
            }

            if (article.points) {
                printer.debug('Article "' + article.title + '" has ' + article.points + ' points for search ' + queryString);
                finalArticleList.push({
                    title: article.title,
                    technicalName: article.technicalName,
                    caption: article.caption,
                    text: article.text,
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
