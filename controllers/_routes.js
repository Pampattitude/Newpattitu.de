'use strict';

exports.defineFrontRoutes = function(serverApp, router) {
    router.get ('*', function(req, res) {
        res.locals.title = 'Hello world';
        return res.render(__dirname + '/../views/front.ejs');
    });

    return router;
};

exports.defineBackOfficeRoutes = function(serverApp, router) {
    router.get ('*', function(req, res) {
        res.locals.title = 'Hello BO world';
        return res.render(__dirname + '/../views/back-office.ejs');
    });

    return router;
};
