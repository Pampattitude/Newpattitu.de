'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'Projects';

    res.locals.page = 'pages/projects.html';
    res.locals.activeTopMenu = 'projects';
    res.locals.hidePageMenu = true;

    return callback();
};
