'use strict';

exports.isLoggedIn = function(req, res, next) {
    if (!req.session || !req.session.user)
        return res.redirect('/back-office/login');

    res.locals.logged = true;
    return next();
};
