'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');

exports.page = function(req, res, callback) {
    res.locals.title = 'Blog';

    res.locals.page = 'pages/article.html';
    res.locals.activeTopMenu = 'blog';

    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback();
        if (!article) return res.redirect('/404');

        res.locals.article = article;

        return callback();
    });
};
