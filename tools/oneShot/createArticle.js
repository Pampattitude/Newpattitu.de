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

mongoose.connection.once('open', function () {
    printer.info('Connected to DB "' + constants.databaseUri + '"');
    requireDir(__dirname + '/../../models/');
    printer.info('Models sync\'ed');

    var generateArticleCount = 9;

    var getUnique = function(arr) {
        var ret = [];

        var i = 0;
        arr.forEach(function(elem) {
            if (i === arr.indexOf(elem))
                ret.push(elem);
            ++i;
        });

        return ret;
    };

    return async.series([
        function(callback) {
            var title = 'Hello, World!';
            var text = '<p>Hey there!</p>' +
                '<p>This is my first second time writing a blog post, so I might come off a little nervous. That’s because I am.</p>' +
                '<p>For those who don’t know me, hi! My name is Guillaume “Pampa” Delahodde and I’m a developer. I love C++, enjoy doodling with Node.js and HTML5 and hate – and I mean it – CSS.</p>' +
                '<p>It’s been a while – maybe a year and a half? – since I wanted to create a blog. I’ve been working, and still am, on a custom system with Node.js / Express.js on the back and HTML5 / CSS3 – and now Angular.js \o/ – on the front (both the old and current codes can be found somewhere on GitHub).<br />' +
                'But getting things right is hard when you don’t know blogging. Hence the Tumblr WordPress. Dammit, I’ll never get that post right.</p>' +
                '<p>So hi, I sincerely hope you’ll enjoy what’s here and, if you do, that you’ll like it on my own system, with my own crazy stuff distracting you from reading!</p>' +
                '<p>Wait, what? People create blogs for them to be read? Damn, I knew it was a bad idea.</p>' +
                '<p class="tldr">Developer, stuff about what I do and like, trying a blogging platform.<br />' +
                'If you no liky, you no stay here.</p>';

            var article = new (mongoose.model('Article'))({
                title: title,
                technicalName: title.split(' ').join('_').replace(/[^a-zA-Z\-_ ]/g, ''),

                text: text,
                tags: getUnique(title.replace(/[^a-zA-Z\-_ ]/g, '').split(' ')),

                type: 'news',

                activated: true,
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
                var text = loremIpsum({count: parseInt(8 + Math.random() * 4, 10), units: 'paragraphs', format: 'html'});

                var article = new (mongoose.model('Article'))({
                    title: title + ' #' + i,
                    technicalName: title.split(' ').join('_') + i,

                    text: text,
                    tags: getUnique(title.split(' ')),

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
