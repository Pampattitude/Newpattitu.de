'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'Hello BO world';
    return callback();
};
