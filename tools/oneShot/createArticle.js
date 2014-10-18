'use strict';

var async = require('async');
var loremIpsum = require('lorem-ipsum');
var mongoose = require('mongoose');
var requireDir = require('require-dir');

var constants = require('../../lib/constants');
var printer = require('../../lib/printer');

mongoose.connect(constants.databaseUri);
mongoose.connection.on('error', function (err) {
    printer.error('Could not open DB connection: ' + err);
    mongoose.connection.close();
    return process.exit(1);
});

return mongoose.connection.once('open', function () {
    printer.info('Connected to DB "' + constants.databaseUri + '"');
    requireDir(__dirname + '/../../models/');
    printer.info('Models sync\'ed');

    var generateArticleCount = 9;

    return async.series([
        function(callback) {
            var title = loremIpsum({count: parseInt(5 + Math.random() * 3, 10), units: 'words', format: 'plain'});
            var caption = loremIpsum({count: parseInt(2 + Math.random(), 10), units: 'paragraphs', format: 'html'});
            var text = loremIpsum({count: parseInt(8 + Math.random() * 4, 10), units: 'paragraphs', format: 'html'});

            var article = new (mongoose.model('Article'))({
                title: title,
                technicalName: title.split(' ').join('_'),

                caption: caption,
                text: text,
                tags: title.split(' '),

                type: (['news', 'life', 'project', 'tutorial'][parseInt(Math.floor(Math.random() * 4), 10)]),

                featured: true,
            });
            
            printer.info('Creating article "' + article.technicalName + '"...');

            return article.save(function(err) {
                if (err) return callback(err);

                printer.info('Article "' + article.technicalName + '" created');
                return callback();
            });
        },
        function(callback) {
            var i = 2;

            return async.whilst(function() { return generateArticleCount--; }, function(whilstCallback) {
                var title = loremIpsum({count: parseInt(5 + Math.random() * 3, 10), units: 'words', format: 'plain'});
                var caption = loremIpsum({count: parseInt(2 + Math.random(), 10), units: 'paragraphs', format: 'html'});
                var text = loremIpsum({count: parseInt(8 + Math.random() * 4, 10), units: 'paragraphs', format: 'html'});

                var article = new (mongoose.model('Article'))({
                    title: title + ' #' + i,
                    technicalName: title.split(' ').join('_') + i,

                    caption: caption,
                    text: text,
                    tags: title.split(' '),

                    type: (['news', 'life', 'project', 'tutorial'][parseInt(Math.floor(Math.random() * 4), 10)]),
                });
                ++i;

                printer.info('Creating article "' + article.technicalName + '"...');

                return article.save(function(err) {
                    if (err) return whilstCallback(err);

                    printer.info('Article "' + article.technicalName + '" created');
                    return whilstCallback();
                });
            }, callback);
        },
    ], function(err) {
        if (err) {
            printer.error(err);
            return process.exit(1);
        } 

        printer.info('Articles created successfully');
        return process.exit(0);
    });
});
