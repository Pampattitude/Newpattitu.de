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
        rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
        rss += '  <channel>\n';
        rss += '    <atom:link href="' + constants.serverHostAccess + '/rss" rel="self" type="application/rss+xml" />\n';
        rss += '    <title>Pampattitu.de</title>\n';
        rss += '    <link>' + constants.serverHostAccess + '</link>\n';
        rss += '    <description>Guillaume "Pampa" Delahodde\'s blog</description>\n';
        rss += '    <category>Tech, Technology, Programming, Game development</category>\n';
        rss += '    <image>\n';
        rss += '      <url>http://i.imgur.com/dkjkMuK.png</url>\n';
        rss += '      <title>Pampattitu.de</title>\n';
        rss += '      <link>' + constants.serverHostAccess + '</link>\n';
        rss += '    </image>\n';
        if (articles && articles.length)
            rss += '    <pubDate>' + articles[0].lastUpdated.toUTCString() + '</pubDate>\n';
        rss += '    <language>en-us</language>\n';

        if (articles) {
            articles.forEach(function(elem) {
                rss += '    <item>\n';
                rss += '      <title>' + utils.dtrim(utils.stripHtml(elem.title)) + '</title>\n';
                rss += '      <link>' + elem.getUrl() + '</link>\n';
                rss += '      <description><![CDATA[' + utils.dtrim(/*utils.stripHtml(*/elem.compressedText/*)*/).replace(/&NewLine;/g, '') + ']]></description>\n';
                rss += '      <guid isPermaLink="true">' + elem.getPermaUrl() + '</guid>\n';
                rss += '      <pubDate>' + elem.lastUpdated.toUTCString() + '</pubDate>\n';
                rss += '      <comments>' + elem.getPermaUrl() + '#comments</comments>\n';
                rss += '      <enclosure url="http://i.imgur.com/dkjkMuK.png" length="26421" type="image/png" />\n';
                rss += '    </item>\n';
            });
        }

        rss += '  </channel>\n';
        rss += '</rss>\n'

        res.set('Content-Type', 'application/rss+xml');
        return callback(null, rss);
    });
};
