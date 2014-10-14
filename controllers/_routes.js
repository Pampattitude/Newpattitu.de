'use strict';

var constants   = require('../lib/constants');

exports.defineFrontRoutes = function(serverApp, router) {
    router.get ('/humans.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/humans.txt'); });
    router.get ('/robots.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/robots.txt'); });

    router.get ('/*', function(req, res) {
        res.locals.title = 'Hello world';
        res.locals.test = {
            va: 'lol',
        };
        res.locals.a = 'haha';
        res.locals.val = 'a';
        res.locals.table = ['test', 'voiture'];

        return res.render('front.html');
    });

    return router;
};

exports.defineBackOfficeRoutes = function(serverApp, router) {
    router.get ('*', function(req, res) {
        res.locals.title = 'Hello BO world';
        return res.render('back-office');
    });

    return router;
};
