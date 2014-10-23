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

    var reports = [
        { "author" : "Pampa", "text" : "Articles page", "created" : new Date("2014-06-30T20:47:46.466Z"), "status" : "open" },
        { "author" : "Pampa", "text" : "Report page still doesn't look good at all (mostly because of the text areas & input boxes)", "created" : new Date("2014-06-30T20:48:55.945Z"), "status" : "open" },
        { "author" : "Anonymous", "text" : "When you click on Home, there is an ugly picture in the middle of the website ! I mean the sky is okay, but the land is like, not green enough for somone who pretends to be a \"togemon\"!", "created" : new Date("2014-06-27T19:21:57.681Z"), "status" : "treated" },
        { "author" : "Anonymous", "text" : "Test", "created" : new Date("2014-07-08T11:34:15.113Z"), "status" : "treated" },
        { "author" : "Souss", "text" : "Calin du jour ! Calin toujours !", "created" : new Date("2014-07-02T12:47:59.149Z"), "status" : "treated" },
        { "author" : "Pampa", "text" : "Home page sucks balls and should be reworked to the extreme.", "created" : new Date("2014-06-30T21:58:01.452Z"), "status" : "closed" },
        { "author" : "Pampa", "text" : "Add back search input in menu. I have no idea how it should be done, though, but it must be added back.", "created" : new Date("2014-07-13T10:34:24.946Z"), "status" : "open" },
        { "author" : "Anonymousloverdu95", "text" : "Le css de bas de page dépasse sur la page article.\r\nSur un nexus 4 dans chrome avec un amour pour les chattons", "created" : new Date("2014-07-14T11:28:28.628Z"), "status" : "open" },
        { "author" : "Anonymous", "text" : "just testing :)", "created" : new Date("2014-07-14T15:07:14.743Z"), "status" : "treated" },
        { "author" : "LoHkie", "text" : "Dans la page About quand on passe le curseur sur le bouton du feed RSS les info qui apparaissent sortent du cadre et sont donc illisible. Au cas où ça joue je suis sur firefox 31.0", "created" : new Date("2014-08-28T20:12:13.245Z"), "status" : "closed" },
    ];

    printer.info('Creating ' + reports.length + ' reports...');
    return async.eachSeries(reports, function(report, reportCallback) {
        var report = new (mongoose.model('Report'))(report);

        return report.save(reportCallback);
    }, function(err) {
        if (err) {
            printer.error(err);
            return process.exit(1);
        } 

        printer.info('Reports created successfully');
        return process.exit(0);
    });
});
