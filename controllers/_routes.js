'use strict';

exports.defineFrontRoutes = function(serverApp, router) {
    router.get ('*', function(req, res) { return res.status(200).send('Hello, world!'); });

    return router;
};

exports.defineBackOfficeRoutes = function(serverApp, router) {
    router.get ('*', function(req, res) { return res.status(200).send('Hello, back-office world!'); });

    return router;
};
