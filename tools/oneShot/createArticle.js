'use strict';

var async = require('async');
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
            var article = new (mongoose.model('Article'))({
                title: 'Lorem ipsum dolor sit amet',
                technicalName: 'loremIpsum',

                caption: '<p>Sed a pellentesque nulla. Ut risus libero, rhoncus eu mauris sagittis, sollicitudin tincidunt nisl. Nunc tempus velit arcu, sed condimentum erat molestie non. Suspendisse elementum eu elit ac sagittis. Maecenas sit amet tempus dolor, ut rutrum elit. Nullam in enim at ligula aliquet ultrices a ut erat. Curabitur facilisis est nibh, vel sollicitudin felis porttitor at. Integer a varius massa. Quisque vulputate convallis posuere. Nunc ut mi et ex malesuada sagittis. Nullam ac ornare elit. Cras sed dui feugiat turpis congue interdum eget ac leo.</p><p>Morbi at egestas lacus, iaculis sodales metus. Duis ultrices rutrum auctor. Cras iaculis, metus in blandit vestibulum, erat turpis euismod tortor, non aliquet augue lorem ut justo. Quisque varius, ex non sollicitudin tincidunt, tellus ipsum fringilla neque, sit amet dapibus est sem vitae ligula.</p>',
                text: 'test',
                tags: ['lorem', 'ipsum', 'dolor', 'sit', 'amet'],

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
                var article = new (mongoose.model('Article'))({
                    title: 'Lorem ipsum dolor sit amet #' + i,
                    technicalName: 'loremIpsum' + i,

                    caption: '<p>Sed a pellentesque nulla. Ut risus libero, rhoncus eu mauris sagittis, sollicitudin tincidunt nisl. Nunc tempus velit arcu, sed condimentum erat molestie non. Suspendisse elementum eu elit ac sagittis. Maecenas sit amet tempus dolor, ut rutrum elit. Nullam in enim at ligula aliquet ultrices a ut erat. Curabitur facilisis est nibh, vel sollicitudin felis porttitor at. Integer a varius massa. Quisque vulputate convallis posuere. Nunc ut mi et ex malesuada sagittis. Nullam ac ornare elit. Cras sed dui feugiat turpis congue interdum eget ac leo.</p><p>Morbi at egestas lacus, iaculis sodales metus. Duis ultrices rutrum auctor. Cras iaculis, metus in blandit vestibulum, erat turpis euismod tortor, non aliquet augue lorem ut justo. Quisque varius, ex non sollicitudin tincidunt, tellus ipsum fringilla neque, sit amet dapibus est sem vitae ligula.</p>',
                    text: 'test',
                    tags: ['lorem', 'ipsum', 'dolor', 'sit', 'amet'],
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
