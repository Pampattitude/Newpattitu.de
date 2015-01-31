'use strict';

var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var printer = require('./printer');
var utils = require('./utils');

exports.send = function(options, callback) {
    if ('production' !== process.env.NODE_ENV) {
        printer.warn('Mail "' + options.subject + '" to ' + JSON.stringify(options.to) + ' not sent because server in ' + process.env.NODE_ENV + ' mode');
        return callback();
    }

    if (!options.to) return callback(new Error('Missing recipient .to text from options'));
    if (!options.subject) return callback(new Error('Missing subject .subject from options'));
    if (!options.html) return callback(new Error('Missing HTML text .html from options'));
    if (!options.text)
        options.text = require('html-to-text').fromString(options.html);

    options.from = 'Mailbottitu.de <mail-bot' + '@' + 'pampattitu.de>';

    var transporter = nodemailer.createTransport(sendmailTransport());

    printer.info('Sending mail "' + options.subject + '" to ' + JSON.stringify(options.to) + '...');
    return transporter.sendMail(options, function(err) {
        if (err) return callback(err);

        printer.info('Mail "' + options.subject + '" to ' + JSON.stringify(options.to) + ' sent');
        return callback();
    });
};

var sendToAdministrator = exports.sendToAdministrator = function(options, callback) {
    options.to = 'Pampattitu.de administrator <pampattitude' + '@' + 'gmail.com>';
    return exports.send(options, callback);
};


exports.sendInactiveMail = function(callback) {
    var now = new Date();

    return exports.sendToAdministrator({
        subject: 'Pampattitu.de - Inactivity - ' + utils.prepadNumber(now.getFullYear(), 4) + '-' + utils.prepadNumber(now.getMonth() + 1) + '-' + utils.prepadNumber(now.getDate()) + ' ' + utils.prepadNumber(now.getHours() % 12) + ':' + utils.prepadNumber(now.getMinutes()) + (12 > now.getHours() ? 'am' : 'pm'),
        html: '<p>Hi Pampa!</p>' +
            '<p>You have not written an article for <a href="http://pampattitu.de">Pampattitu.de</a> in a long time.<br />' + 
            'Go to the back-office <a href="http://pampattitu.de/back-office/articles">articles page</a> to write a new one.<br />' +
            '<span style="font-size: 0.8em;">If you lack inspiration, you may find some on <a href="https://twitter.com">Twitter</a> or <a href="http://www.reddit.com/me/m/engineering">Reddit</a>.</span></p>' +
            '<p>See you soon!<br />' +
            'Mailbottitu.de</p>',
    }, callback);
};

exports.sendDaemonError = function(err, callback) {
    var now = new Date();

    return exports.sendToAdministrator({
        subject: 'Pampattitu.de - Daemon error - ' + utils.prepadNumber(now.getFullYear(), 4) + '-' + utils.prepadNumber(now.getMonth() + 1) + '-' + utils.prepadNumber(now.getDate()) + ' ' + utils.prepadNumber(now.getHours() % 12) + ':' + utils.prepadNumber(now.getMinutes()) + (12 > now.getHours() ? 'am' : 'pm'),
        html: '<p>Hi Pampa!</p>' +
            '<p>An error occured in a daemon:<br />' +
            '<pre>' + (err.stack || err.message || err) + '</pre></p>' +
            '<p>Please check it out ASAP.</p>' + 
            '<p>Yours truly,<br />' +
            'A worried Mailbottitu.de</p>',
    }, callback);
};
