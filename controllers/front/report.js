'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'Home';

    res.locals.page = 'pages/report.html';
    res.locals.hidePageMenu = true;

    return callback();
};
