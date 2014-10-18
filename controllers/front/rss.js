'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var utils = require('../../lib/utils');

exports.get = function(req, res, callback) {
    res.locals.title = 'Blog';

    res.locals.page = 'pages/home.html';
    res.locals.activeTopMenu = 'blog';

    return mongoose.model('Article').find().sort({created: -1}).exec(function(err, articles) {
        if (err)
            return callback(err);

        var rss = '';
        rss += '<?xml version="1.0"?>\n';
        rss += '<rss version="2.0">\n';
        rss += '  <channel>\n';
        rss += '    <title>Pampattitu.de</title>\n';
        rss += '    <description>Guillaume "Pampa" Delahodde\'s very own website</description>\n';
        rss += '    <link>' + constants.serverBaseUrl + '</link>\n';
        rss += '    <language>en-us</language>\n';

        if (articles) {
            articles.forEach(function(elem) {
                rss += '    <item>\n';
                rss += '      <title>' + utils.stripHtml(elem.title) + '</title>\n';
                rss += '      <link>' + constants.serverBaseUrl + '/article/' + elem.technicalName + '</link>\n';
                rss += '      <description>' + utils.stripHtml(elem.caption) + '</description>\n';
                rss += '      <guid>' + constants.serverBaseUrl + '/article/' + elem.technicalName + '</guid>\n';
                rss += '      <pubDate>' + elem.created.toUTCString() + '</pubDate>\n';
                rss += '    </item>\n';
            });
        }

        rss += '  </channel>\n';
        rss += '</rss>\n'

        res.set('Content-Type', 'text/xml');
        return callback(null, rss);
    });
};
