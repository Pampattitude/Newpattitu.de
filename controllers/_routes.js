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
        blog:           require('./front/blog'),
        error:          require('./front/error'),
        projects:       require('./front/projects'),
        report:         require('./front/report'),
        rss:            require('./front/rss'),
        search:         require('./front/search'),
    };

    var middleware = require('./middleware/front.js');
    router.use (middleware.defend);
    router.use (middleware.postUniqueSessionStat);
    router.use (middleware.postPageViewStat);

    router.get ('/humans.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/humans.txt'); });
    router.get ('/robots.txt', function(req, res) { return res.sendFile(constants.viewMiscPath + '/robots.txt'); });

    router.get ('/', function(req, res) { return res.redirect('/blog'); });

    router.get ('/blog/:pageNumber?', bindPage(controllers.blog.page));

    router.get ('/article/:articleTechnicalName', bindPage(controllers.article.page));
    router.post('/article/:articleTechnicalName/comment', bindPost(controllers.article.postComment));
    router.get ('/article/preview/:articleTechnicalName', middleware.isLoggedInBackOffice, bindPage(controllers.article.previewPage));

    router.get ('/search/:pageNumber?', bindPage(controllers.search.page));

    router.get ('/projects', bindPage(controllers.projects.page));

    router.get ('/about', bindPage(controllers.about.page));

    router.get ('/report', bindPage(controllers.report.page));
    router.post('/report/send', bindAjax(controllers.report.send));

    router.get ('/rss', bindGet(controllers.rss.get));

    router.get ('/ajax/article/:articleTechnicalName/getComments', bindAjax(ajax.article.getComments));
    router.post('/ajax/article/:articleTechnicalName/comment', bindAjax(ajax.article.postComment));
    router.post('/ajax/article/:articleTechnicalName/:network/incShare', bindAjax(ajax.article.incrementShare));
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
        notifications: require('./back-office/notifications'),
        reports: require('./back-office/reports'),
        stats: require('./back-office/stats'),
    };
    var middleware = require('./middleware/back.js');

    router.get ('/login', bindPage(controllers.login.page));
    router.post('/login', bindAjax(controllers.login.ajaxLogin));
    router.post('/logout', bindAjax(controllers.login.ajaxLogout));

    router.get ('/stats', middleware.isLoggedIn, bindPage(controllers.stats.page));
    router.get ('/stats/comments/general', middleware.isLoggedIn, bindAjax(controllers.stats.commentGeneralStats));
    router.get ('/stats/uniqueSessions/general', middleware.isLoggedIn, bindAjax(controllers.stats.uniqueSessionGeneralStats));
    router.get ('/stats/uniqueSessions/routes', middleware.isLoggedIn, bindAjax(controllers.stats.uniqueSessionRouteStats));
    router.get ('/stats/uniqueSessions/referrer', middleware.isLoggedIn, bindAjax(controllers.stats.uniqueSessionReferrerStats));
    router.get ('/stats/pageViews/general', middleware.isLoggedIn, bindAjax(controllers.stats.pageViewGeneralStats));
    router.get ('/stats/pageViews/routes', middleware.isLoggedIn, bindAjax(controllers.stats.pageViewRouteStats));
    router.get ('/stats/pageViews/referrer', middleware.isLoggedIn, bindAjax(controllers.stats.pageViewReferrerStats));
    router.get ('/stats/pageViews/browser', middleware.isLoggedIn, bindAjax(controllers.stats.pageViewBrowserStats));
    router.get ('/stats/pageViews/device', middleware.isLoggedIn, bindAjax(controllers.stats.pageViewDeviceStats));

    router.get ('/stats/pageViews/all', middleware.isLoggedIn, bindAjax(controllers.stats.pageViewAllStats));
    router.get ('/stats/uniqueSessions/all', middleware.isLoggedIn, bindAjax(controllers.stats.uniqueSessionAllStats));
    router.get ('/stats/comments/all', middleware.isLoggedIn, bindAjax(controllers.stats.commentAllStats));

    router.get ('/articles', middleware.isLoggedIn, bindPage(controllers.articles.page));
    router.get ('/article/:articleId?/edit', middleware.isLoggedIn, bindPage(controllers.articles.editPage));

    router.get ('/article/getFeatured', middleware.isLoggedIn, bindAjax(controllers.articles.getFeatured));
    router.post('/article/:articleId/setFeatured', middleware.isLoggedIn, bindAjax(controllers.articles.setFeatured));

    router.post('/article/:articleId/activate', middleware.isLoggedIn, bindAjax(controllers.articles.activate));
    router.post('/article/:articleId/deactivate', middleware.isLoggedIn, bindAjax(controllers.articles.deactivate));

    router.post('/article/:articleId/save', middleware.isLoggedIn, bindAjax(controllers.articles.save));
    router.post('/article/:articleId/delete', middleware.isLoggedIn, bindAjax(controllers.articles.remove));

    router.get ('/article/generateTechnicalName', middleware.isLoggedIn, bindAjax(controllers.articles.generateTechnicalName));

    router.get ('/article/:articleId/comments', middleware.isLoggedIn, bindPage(controllers.articles.commentModerationPage));
    router.post('/article/:articleId/comment/:commentId/setStatus', middleware.isLoggedIn, bindAjax(controllers.articles.setCommentStatus));
    router.post('/article/:articleId/comment/:commentId/delete', middleware.isLoggedIn, bindAjax(controllers.articles.removeComment));

    router.get ('/reports/', middleware.isLoggedIn, bindPage(controllers.reports.page));
    router.post('/report/:reportId/setStatus', middleware.isLoggedIn, bindAjax(controllers.reports.setStatus));
    router.post('/report/:reportId/delete', middleware.isLoggedIn, bindAjax(controllers.reports.remove));

    router.get ('/notifications/comments/new', middleware.isLoggedIn, bindAjax(controllers.notifications.newComments));
    router.get ('/notifications/reports/new', middleware.isLoggedIn, bindAjax(controllers.notifications.newReports));

    router.get ('/', middleware.isLoggedIn, function(req, res) { return res.redirect('/back-office/stats'); });

    router.get ('*', middleware.isLoggedIn, bindPage(controllers.error.page404));
    router.use (function(err, req, res, next) {
        res.locals.logged = (undefined != req.session && undefined != req.session.user);

        printer.error(err);
        return bindPage(controllers.error.page500)(req, res);
    });

    return router;
};
