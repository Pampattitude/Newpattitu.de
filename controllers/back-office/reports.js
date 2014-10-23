'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'Reports';

    res.locals.page = 'pages/reports.html'
    res.locals.activeTopMenu = 'reports';

    return callback();
};
