'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'Report';

    res.locals.page = 'pages/report.html';
    res.locals.hidePageMenu = true;

    return callback();
};
