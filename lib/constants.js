'use strict';

var define = function(propName, propValue) {
    return Object.defineProperty(module.exports, propName, {
        value:          propValue,
        enumerable:     true,
        writable:       false,
    });
};

// Development
if ('development' === process.NODE_ENV) {
    define('serverHost', 'localhost');
    define('serverPort', '8337');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Development

// Preproduction
if ('preproduction' === process.NODE_ENV) {
    define('serverHost', 'beta.pampattitu.de');
    define('serverPort', '8337');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Preproduction

// Production
if ('production' === process.NODE_ENV) {
    define('serverHost', 'pampattitu.de');
    define('serverPort', '7338');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Production

define('frontRoute', '/');
define('backOfficeRoute', '/back-office');

define('databaseUri', 'mongodb://localhost/pampattitu_de');

define('viewBasePath', require('path').resolve(__dirname + '/../views'));
define('viewPagesPath', require('path').resolve(__dirname + '/../views/pages'));
define('viewMiscPath', require('path').resolve(__dirname + '/../views/misc')); // For stuff like humans.txt and robots.txt
