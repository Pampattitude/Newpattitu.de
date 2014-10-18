'use strict';

var bind        = require('../lib/bind').bind;
var bindArg     = require('../lib/bind').arg;
var constants   = require('../lib/constants');
var methods     = require('../lib/methods');

var bindGet = function(m) { return bind(methods.get, bindArg._1, bindArg._2, m); };
var bindPost = function(m) { return bind(methods.post, bindArg._1, bindArg._2, m); };
var bindAjax = function(m) { return bind(methods.ajax, bindArg._1, bindArg._2, m); };

exports.defineFrontRoutes = function(serverApp, router) {
    var bindPage = function(m) { return bind(methods.page, bindArg._1, bindArg._2, m, 'front.html'); };

    var ajax = {
        twitter:        require('./ajax/twitter'),
    };

    var controllers = {
        about:  require('./front/about'),
        error:  require('./front/error'),
        home:   require('./front/home'),
        report: require('./front/report'),
        rss:    require('./front/rss'),
        search: require('./front/search'),
    };

    router.get ('/humans.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/humans.txt'); });
    router.get ('/robots.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/robots.txt'); });

    router.get ('/home', bindPage(controllers.home.page));
    router.get ('/', bindPage(controllers.home.page));

    router.get ('/search', bindPage(controllers.search.page));

    router.get ('/about', bindPage(controllers.about.page));

    router.get ('/report', bindPage(controllers.report.page));

    router.get ('/rss', bindGet(controllers.rss.get));

    router.get ('/ajax/twitter/getLatest', bindAjax(ajax.twitter.getLatest));

    router.get ('/*', bindPage(controllers.error.page404));
    router.use (function(err, req, res, next) {
        console.error(err);
        return bindPage(controllers.error.page500)(req, res);
    });

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
