'use strict';

var async = require('async');
var mongoose = require('mongoose');
var currentWeekNumber = require('current-week-number');

var constants = require('../../lib/constants');
var utils = require('../../lib/utils');

exports.page = function(req, res, callback) {
    res.locals.title = 'Statistics';

    res.locals.page = 'pages/stats.html';
    res.locals.activeTopMenu = 'stats';

    return callback();
};

exports.articleGeneralStats = function(req, res, callback) {
    var minDate = new Date();
    minDate.setHours(0); minDate.setMinutes(0); minDate.setSeconds(0); minDate.setMilliseconds(0);
    minDate.setMonth(minDate.getMonth() - constants.statsMonthsBefore);

    return mongoose.model('Article').find({created: {$gte: minDate}}).sort({created: 1}).exec(function(err, articles) {
        if (err) return callback({code: 500, message: err});

        var articleList = [];
        articles.forEach(function(article) {
            var formattedDate = 'W ' + currentWeekNumber(article.created) + ' - ' + article.created.getFullYear();

            for (var i = 0 ; articleList.length > i ; ++i) {
                if (formattedDate == articleList[i].time) {
                    ++articleList[i].count;
                    return ;
                }
            }

            articleList.push({time: formattedDate, count: 1});
            return ;
        });

        return callback(null, {generalArticleStatistics: articleList});
    });
};

exports.commentGeneralStats = function(req, res, callback) {
    var minDate = new Date();
    minDate.setHours(0); minDate.setMinutes(0); minDate.setSeconds(0); minDate.setMilliseconds(0);
    minDate.setMonth(minDate.getMonth() - constants.statsMonthsBefore);

    return mongoose.model('Comment').find({created: {$gte: minDate}}).sort({created: 1}).exec(function(err, comments) {
        if (err) return callback({code: 500, message: err});

        var commentList = [];
        comments.forEach(function(comment) {
            var formattedDate = 'W ' + currentWeekNumber(comment.created) + ' - ' + comment.created.getFullYear();

            for (var i = 0 ; commentList.length > i ; ++i) {
                if (formattedDate == commentList[i].time) {
                    ++commentList[i].count;
                    return ;
                }
            }

            commentList.push({time: formattedDate, count: 1});
            return ;
        });

        return callback(null, {generalCommentStatistics: commentList});
    });
};
