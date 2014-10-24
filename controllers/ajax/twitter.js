'use strict';

var cache = require('memory-cache');
var twitter = require('twitter');

var constants = require('../../lib/constants');

exports.getLatest = function(req, res, callback) {
    var previousData = cache.get('latestTweets');
    if (previousData)
        return callback(null, previousData);

    var twit = new twitter({
        consumer_key: constants.twitterApiKey,
        consumer_secret: constants.twitterApiSecret,
        access_token_key: constants.twitterAccessKey,
        access_token_secret: constants.twitterAccessSecret,
    });

    return twit.get('/statuses/user_timeline.json', {}, function(data) {
        if (!data || !data.length)
            return callback(null, []);
        else if (data.statusCode)
            return callback({
                code: data.statusCode,
                message: JSON.stringify(data.errors),
            });

        if (constants.frontTwitterListCount < data.length)
            data = data.slice(0, constants.frontTwitterListCount);

        var tweets = data.map(function(elem) {
            return {
                text: elem.text,
                url: 'https://twitter.com/' + elem.user.screen_name + '/status/' + elem.id_str,
                retweetCount: elem.retweet_count,
                favoriteCount: elem.favorite_count,
                created: new Date(elem.created_at),
            };
        });

        cache.put('latestTweets', tweets, 60 * 1000 /* ms */);

        return callback(null, tweets);
    });
};
