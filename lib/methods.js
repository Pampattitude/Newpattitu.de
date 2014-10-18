'use strict';

var printer     = require('./printer');

exports.page = function(req, res, module, templatePage) {
    return module(req, res, function(err) {
        if (err) {
            printer.error(err.message);
            return res.redirect('/' + err.code);
        }

        return res.render(templatePage);
    });
};

exports.get = exports.ajax = function(req, res, module) {
    return module(req, res, function(err, data) {
        if (err) {
            printer.error(err.message);
            return res.status(err.code).json({
                message: err.message
            });
        }

        if ('string' == typeof data)
            return res.status(200).send(data);
        return res.status(200).json(data);
    });
};

exports.post = function(req, res, module) {
    return module(req, res, function(err, data) {
        if (err) {
            printer.error(err.message);
            return res.status(err.code).json({
                message: err.message
            });
        }

        return res.redirect(data);
    });
};
