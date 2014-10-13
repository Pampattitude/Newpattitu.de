'use strict';

var define = function(propName, propValue) {
    return Object.defineProperty(exports, propName, {
        value:          propValue,
        enumerable:     true,
        writable:       false,
    });
};

define('databaseUri', 'mongodb://localhost/pampattitu_de');
