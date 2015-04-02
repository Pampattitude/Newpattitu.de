'use strict';

var mongoose = require('mongoose');

var disqus = require('../../lib/disqus');
var stattitude = require('../../lib/stattitude');

exports.getCommentCount = function(req, res, callback) {
    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article)
            return callback(null, '/404');

        return disqus.getUrlPosts(article.getUrl(), function(err, posts) {
            if (err) return callback(err);

            return callback(null, {
                commentCount: posts.length,
            });
        });
    });
};

exports.getComments = function(req, res, callback) {
    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return callback(null, '/404');

        return mongoose.model('Comment').find({article: article._id}).sort({created: 1}).populate('user').exec(function(err, comments) {
            if (err) return callback(err);

            return callback(null, {
                commentList: comments,
            });
        });
    });
};

exports.postComment = function(req, res, callback) {
    if (!req.body.author ||
        2 >= req.body.author.length)
        return callback(null, {code: 400, message: 'Name too short'});
    else if (32 < req.body.author.length)
        return callback(null, {code: 400, message: 'Name too long'});

    if (!req.body.text ||
        10 >= req.body.text.length)
        return callback(null, {code: 400, message: 'Comment content too short'});
    else if (4096 < req.body.text.length)
        return callback(null, {code: 400, message: 'Comment content too long'});

    return mongoose.model('Article').findOne({technicalName: req.params.articleTechnicalName}, function(err, article) {
        if (err) return callback(err);
        if (!article) return callback(null, '/404');

        var comment = new (mongoose.model('Comment'))({
            article: article._id,

            author: req.body.author,
            text: req.body.text,
        });

        if (req.session.user)
            comment.user = req.session.user._id;

        return comment.save(function(err) {
            if (err) return callback(err);

            stattitude.post('comment', {});
            return callback(null);
        });
    });
};

exports.incrementShare = function(req, res, callback) {
    var findOptions = {
        technicalName: req.params.articleTechnicalName,
    };
    var updateOptions = {
        $inc: {
        },
    };
    updateOptions.$inc['shares.' + req.params.network] = 1;

    return mongoose.model('Article').findOneAndUpdate(findOptions, updateOptions, function(err, modifiedArticle) {
        if (err) return callback({code: 500, message: err});
        if (!modifiedArticle) return callback({code: 404, message: 'Article not found'});

        return callback();
    });
};
