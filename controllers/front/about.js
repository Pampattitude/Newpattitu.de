'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'About';

    res.locals.page = 'pages/about.html';
    res.locals.activeTopMenu = 'about';
    res.locals.hidePageMenu = true;

    return callback();
};
