'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var utils = require('../../lib/utils');

exports.page = function(req, res, callback) {
    res.locals.title = 'Statistics';

    res.locals.page = 'pages/stats.html';
    res.locals.activeTopMenu = 'stats';

    return callback();
};

exports.articleGeneralStats = function(req, res, callback) {
    return mongoose.model('Article').find({}).sort({created: 1}).exec(function(err, articles) {
        if (err) return callback({code: 500, message: err});

        var articleList = [];
        articles.forEach(function(article) {
            var formattedDate = article.created.getFullYear() + '-' + utils.prepadNumber(article.created.getMonth() + 1, 2);

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
    return mongoose.model('Comment').find({}).sort({created: 1}).exec(function(err, comments) {
        if (err) return callback({code: 500, message: err});

        var commentList = [];
        comments.forEach(function(comment) {
            var formattedDate = comment.created.getFullYear() + '-' + utils.prepadNumber(comment.created.getMonth() + 1, 2);

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
