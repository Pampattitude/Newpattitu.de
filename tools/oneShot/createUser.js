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

    var user = new (mongoose.model('User'))({
        username: 'Pampa',
        password: '1234',
        rights: 'admin',
    });

    printer.info('Creating user "' + user.username + '"...');

    user.save(function(err) {
        if (err) {
            printer.error(err);
            return process.exit(1);
        }

        printer.info('User "' + user.username + '" created');

        return process.exit(0);
    });
});
