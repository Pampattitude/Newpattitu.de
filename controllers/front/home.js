'use strict';

exports.page = function(req, res, callback) {
    res.locals.title = 'Hello world';
    res.locals.test = {
        va: 'lol',
    };
    res.locals.a = 'haha';
    res.locals.val = 'a';
    res.locals.table = ['test', 'voiture'];

    return callback();
};
