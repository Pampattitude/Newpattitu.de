'use strict';

var bind        = require('../lib/bind').bind;
var bindArg     = require('../lib/bind').arg;
var constants   = require('../lib/constants');
var methods     = require('../lib/methods');
var printer     = require('../lib/printer');

var bindGet = function(m) { return bind(methods.get, bindArg._1, bindArg._2, m); };
var bindPost = function(m) { return bind(methods.post, bindArg._1, bindArg._2, m); };
var bindAjax = function(m) { return bind(methods.ajax, bindArg._1, bindArg._2, m); };

exports.defineFrontRoutes = function(serverApp, router) {
    var bindPage = function(m) { return bind(methods.page, bindArg._1, bindArg._2, m, 'front/layout.html'); };

    var ajax = {
        article:        require('./ajax/article'),
        twitter:        require('./ajax/twitter'),
    };

    var controllers = {
        about:          require('./front/about'),
        article:        require('./front/article'),
        error:          require('./front/error'),
        home:           require('./front/home'),
        report:         require('./front/report'),
        rss:            require('./front/rss'),
        search:         require('./front/search'),
    };

    router.get ('/humans.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/humans.txt'); });
    router.get ('/robots.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/robots.txt'); });

    router.get ('/blog', bindPage(controllers.home.page));
    router.get ('/home', function(req, res) { return res.redirect('/blog'); });
    router.get ('/', function(req, res) { return res.redirect('/blog'); });

    router.get ('/article/:articleTechnicalName', bindPage(controllers.article.page));
    router.post('/article/:articleTechnicalName/comment', bindPost(controllers.article.postComment));

    router.get ('/search', bindPage(controllers.search.page));

    router.get ('/about', bindPage(controllers.about.page));

    router.get ('/report', bindPage(controllers.report.page));

    router.get ('/rss', bindGet(controllers.rss.get));

    router.get ('/ajax/article/:articleTechnicalName/getComments', bindAjax(ajax.article.getComments));
    router.post('/ajax/article/:articleTechnicalName/comment', bindAjax(ajax.article.postComment));
    router.get ('/ajax/twitter/getLatest', bindAjax(ajax.twitter.getLatest));

    router.get ('/*', bindPage(controllers.error.page404));
    router.use (function(err, req, res, next) {
        printer.error(err);
        return bindPage(controllers.error.page500)(req, res);
    });

    return router;
};

exports.defineBackOfficeRoutes = function(serverApp, router) {
    var bindPage = function(m) { return bind(methods.page, bindArg._1, bindArg._2, m, 'back-office/layout.html'); };

    var controllers = {
        articles: require('./back-office/articles'),
        error: require('./back-office/error'),
        login: require('./back-office/login'),
        stats: require('./back-office/stats'),
    };
    var middleware = require('./middleware/back.js');

    router.get ('/login', bindPage(controllers.login.page));
    router.post('/login', bindAjax(controllers.login.ajaxLogin));
    router.post('/logout', bindAjax(controllers.login.ajaxLogout));

    router.get ('/stats', middleware.isLoggedIn, bindPage(controllers.stats.page));

    router.get ('/articles', middleware.isLoggedIn, bindPage(controllers.articles.page));
    router.get ('/article/:technicalName?/edit', middleware.isLoggedIn, bindPage(controllers.articles.editPage));
    router.post('/article/:technicalName/activate', middleware.isLoggedIn, bindAjax(controllers.articles.activate));
    router.post('/article/:technicalName/deactivate', middleware.isLoggedIn, bindAjax(controllers.articles.deactivate));
    router.post('/article/:technicalName/delete', middleware.isLoggedIn, bindAjax(controllers.articles.remove));

    router.get ('/', middleware.isLoggedIn, function(req, res) { return res.redirect('/back-office/stats'); });

    router.get ('*', middleware.isLoggedIn, bindPage(controllers.error.page404));
    router.use (function(err, req, res, next) {
        res.locals.logged = (undefined != req.session && undefined != req.session.user);

        printer.error(err);
        return bindPage(controllers.error.page500)(req, res);
    });

    return router;
};
