'use strict';

var path        = require('path');

var define = function(propName, propValue) {
    return Object.defineProperty(module.exports, propName, {
        value:          propValue,
        enumerable:     true,
        writable:       false,
    });
};

// Development
if ('development' === process.env.NODE_ENV) {
    define('serverHost', 'localhost');
    define('serverPort', '8337');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Development

// Preproduction
if ('preproduction' === process.env.NODE_ENV) {
    define('serverHost', 'beta.pampattitu.de');
    define('serverPort', '8337');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Preproduction

// Production
if ('production' === process.env.NODE_ENV) {
    define('serverHost', 'pampattitu.de');
    define('serverPort', '7338');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
define('serverHostAccess', 'http://' + exports.serverHost);
// !Production

define('frontRoute', '/');
define('backOfficeRoute', '/back-office');

define('databaseUri', 'mongodb://localhost/pampattitu_de');

define('sessionSecret', 'cafe');

define('viewBasePath', path.resolve(__dirname + '/../views'));
define('viewPagesPath', path.resolve(__dirname + '/../views/pages'));
define('viewMiscPath', path.resolve(__dirname + '/../views/misc')); // For stuff like humans.txt and robots.txt

define('resourcePath', path.resolve(__dirname + '/../resources'));

/* Twitter */
define('twitterUserId', null);
define('twitterApiKey', null);
define('twitterApiSecret', null);
define('twitterAccessKey', null);
define('twitterAccessSecret', null);

define('frontTwitterListCount', 3);
/* !Twitter */

/* Disqus */
define('disqusApiSecret', null);
define('disqusAccessToken', null);

define('disqusDataCacheTime', 10 * 60 * 1000); // ms, so 10 minutes
/* !Disqus */

define('frontBlogPageArticleCount', 10);
define('frontSearchPageArticleCount', 10);
define('frontRelatedArticleCount', 4);

define('searchStringMaxLength', 128);
define('rssMaxFeedItemCount', 20);

define('statsMonthsBefore', 2); // Stats will only show up to three months before
