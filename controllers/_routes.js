'use strict';

var bind        = require('../lib/bind').bind;
var bindArg     = require('../lib/bind').arg;
var constants   = require('../lib/constants');
var methods     = require('../lib/methods');

var bindGet = function(m) { return bind.bind(methods.get, bindArg._1, bindArg._2, m); };
var bindPost = function(m) { return bind.bind(methods.post, bindArg._1, bindArg._2, m); };
var bindAjax = function(m) { return bind.bind(methods.ajax, bindArg._1, bindArg._2, m); };

exports.defineFrontRoutes = function(serverApp, router) {
    var bindPage = function(m) { return bind(methods.page, bindArg._1, bindArg._2, m, 'front.html'); };

    var controllers = {
        home: require('./front/home'),
    };

    router.get ('/humans.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/humans.txt'); });
    router.get ('/robots.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/robots.txt'); });

    router.get ('/js/:file', function(req, res) { return res.sendFile(constants.viewBasePath + '/js/' + req.params.file + '.js'); })

    router.get ('/*', bindPage(controllers.home.page));

    return router;
};

exports.defineBackOfficeRoutes = function(serverApp, router) {
    var bindPage = function(m) { return bind(methods.page, bindArg._1, bindArg._2, m, 'back-office.html'); };

    var controllers = {
        home: require('./back-office/home'),
    };

    router.get ('*', bindPage(controllers.home.page));

    return router;
};
