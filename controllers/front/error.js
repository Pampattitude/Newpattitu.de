'use strict';

exports.page404 = function(req, res, callback) {
    res.locals.title = '404 Not Found';

    res.locals.page = 'pages/404.html';
    res.locals.hidePageMenu = true;

    return callback();
};

exports.page500 = function(req, res, callback) {
    res.locals.title = '500 Internal Server Error';

    res.locals.page = 'pages/500.html';
    res.locals.hidePageMenu = true;

    return callback();
};
