'use strict';

var url = require('url');

var printer = require('../../lib/printer');
var stattitude = require('../../lib/stattitude');

exports.defend = function(req, res, next) {
    var referrer = req.headers.referer || req.headers.Referer ||
        req.headers.referrer || req.headers.Referrer;
    if (referrer)
        referrer = url.parse(referrer || '').hostname;

    if (/^ift.tt/.test(referrer)) {
        printer.warn('Got a request via ift.tt, sent it to oblivion');
        return res.status(403).send('Go to hell, you\'re messing with my stats.');
    }
    return next();
};

exports.postUniqueSessionStat = function(req, res, next) {
    if (req.cookies['connect.sid']) // Means session cookie has already been set, i.e. not a new user
        return next();

    if (/^\/ajax\//.test(req.url || ''))
        return next(); // Skip /ajax/* URLs like Twitter get
    else if (/^\/article\/preview\//.test(req.url || ''))
        return next(); // Skip /article/preview/* URLs because they're from me
    else if (/^\/robots.txt/.test(req.url || ''))
        return next(); // Skip /robots.txt because it means it's a spider

    var pageUrl = req.url || '/';

    var referrer = req.headers.referer || req.headers.Referer ||
        req.headers.referrer || req.headers.Referrer;
    if (referrer)
        referrer = url.parse(referrer || '').hostname;

    stattitude.post('uniqueSession', {
        page: pageUrl,
        referrer: referrer
    }); // Do not wait for reply
    return next();
};

exports.postPageViewStat = function(req, res, next) {
    if (/^\/ajax\//.test(req.url || ''))
        return next(); // Skip /ajax/* URLs like Twitter get
    else if (/^\/article\/preview\//.test(req.url || ''))
        return next(); // Skip /article/preview/* URLs because they're from me

    var pageUrl = req.url || '/';

    var referrer = req.headers.referer || req.headers.Referer ||
        req.headers.referrer || req.headers.Referrer;
    if (referrer)
        referrer = url.parse(referrer || '').hostname;

    var userAgent = req.headers['user-agent'] || '';

    stattitude.post('pageView', {
        page: pageUrl,
        referrer: referrer,
        userAgent: userAgent,
    }); // Do not wait for reply
    return next();
};

exports.isLoggedInBackOffice = function(req, res, next) {
    if (!req.session || !req.session.user)
        return res.redirect('/back-office/login');

    res.locals.logged = true;
    return next();
};
