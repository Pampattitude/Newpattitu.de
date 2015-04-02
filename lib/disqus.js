'use strict';

var Disqus = require('disqus-node');
var memoryCache = require('memory-cache');

var constants = require('./constants');

exports.client = null;

exports.connect = function(callback) {
    exports.client = new Disqus({
        api_secret:     constants.disqusApiSecret,
        access_token:   constants.disqusAccessToken,
        https:          true,
    });

    return callback();
};

exports.listThreads = function(callback) {
    if (!exports.client)
        return callback(new Error('Disqus client has not been initialized'));

    var cacheData = memoryCache.get('disqus-thread-list');
    if (cacheData)
        return callback(null, cacheData);

    return exports.client.forums.listThreads({
        forum: 'pampattitude',
    }, function (err, res) {
        if (err)
            return callback(err);

        memoryCache.put('disqus-thread-list', res.response, constants.disqusDataCacheTime);
        return callback(null, res.response);
    });
};

exports.getThreadPosts = function(threadId, callback) {
    if (!exports.client)
        return callback(new Error('Disqus client has not been initialized'));

    var cacheData = memoryCache.get('disqus-thread-post-list-' + threadId);
    if (cacheData)
        return callback(null, cacheData);

    return exports.client.posts.list({
        thread: '' + threadId,
        forum: 'pampattitude',
    }, function (err, res) {
        if (err)
            return callback(err);

        memoryCache.put('disqus-thread-post-list-' + threadId, res.response, constants.disqusDataCacheTime);
        return callback(null, res.response);
    });
};

exports.getUrlPosts = function(threadUrl, callback) {
    if (!exports.client)
        return callback(new Error('Disqus client has not been initialized'));

    // No cache because listThreads() and getThreadPosts already have cache implemented, and multiple
    // cache levels could lead to longer update times

    return exports.listThreads(function(err, res) {
        if (err)
            return callback(err);

        var thread = null;
        for (var i = 0 ; res.length > i ; ++i) {
            if (threadUrl == res[i].link) {
                thread = res[i];
                break ;
            }
        }

        if (!thread)
            return callback(new Error('Unknown or closed thread "' + threadUrl + '"'));

        return exports.getThreadPosts(thread.id, callback);
    });
};
