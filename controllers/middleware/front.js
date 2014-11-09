'use strict';

var url = require('url');

var stattitude = require('../../lib/stattitude');

exports.postPageViewStat = function(req, res, next) {
    if (/^\/ajax\//.test(req.url || ''))
        return next(); // Skip /ajax/* URLs like Twitter get

    var pageUrl = req.url || '/';

    var referrer = req.headers.referer || req.headers.Referer ||
        req.headers.referrer || req.headers.Referrer;
    if (referrer)
        referrer = url.parse(referrer || '').host;

    stattitude.post('pageView', {
        page: pageUrl,
        referrer: referrer
    }); // Do not wait for reply
    return next();
};

exports.isLoggedInBackOffice = function(req, res, next) {
    if (!req.session || !req.session.user)
        return res.redirect('/back-office/login');

    res.locals.logged = true;
    return next();
};
