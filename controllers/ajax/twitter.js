'use strict';

var twitter = require('twitter');

var constants = require('../../lib/constants');

exports.getLatest = function(req, res, callback) {
    var twit = new twitter({
        consumer_key: constants.twitterApiKey,
        consumer_secret: constants.twitterApiSecret,
        access_token_key: constants.twitterAccessKey,
        access_token_secret: constants.twitterAccessSecret,
    });

    return twit.get('/statuses/user_timeline.json', {}, function(data) {
        if (!data)
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

        return callback(null, tweets);
    });
};
