'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'Home';

    res.locals.page = 'pages/home.html';

    return callback();
};
