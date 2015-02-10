'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var utils = require('../../lib/utils');

exports.get = function(req, res, callback) {
    res.locals.title = 'Blog';

    res.locals.page = 'pages/home.html';
    res.locals.activeTopMenu = 'blog';

    return mongoose.model('Article').find({activated: true}).sort({created: -1}).limit(constants.rssMaxFeedItemCount).exec(function(err, articles) {
        if (err)
            return callback(err);

        var rss = '';
        rss += '<?xml version="1.0"?>\n';
        rss += '<rss version="2.0">\n';
        rss += '  <channel>\n';
        rss += '    <title>Pampattitu.de</title>\n';
        rss += '    <link>' + constants.serverHostAccess + '</link>\n';
        rss += '    <description>Guillaume "Pampa" Delahodde\'s blog</description>\n';
        rss += '    <language>en-us</language>\n';

        if (articles) {
            articles.forEach(function(elem) {
                rss += '    <item>\n';
                rss += '      <title>' + utils.dtrim(utils.stripHtml(elem.title)) + '</title>\n';
                if ('flash' != elem.type) // Do not add link if article with no link
                    rss += '      <link>' + constants.serverHostAccess + '/article/' + elem.technicalName + '</link>\n';
                rss += '      <description>' + utils.dtrim(utils.stripHtml(elem.compressedText)).replace(/&NewLine;/g, '') + '</description>\n';
                rss += '      <guid isPermaLink="false">article/' + elem.technicalName + '</guid>\n';
                rss += '      <pubDate>' + elem.created.toUTCString() + '</pubDate>\n';
                rss += '    </item>\n';
            });
        }

        rss += '  </channel>\n';
        rss += '</rss>\n'

        res.set('Content-Type', 'application/rss+xml');
        return callback(null, rss);
    });
};
