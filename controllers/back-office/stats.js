'use strict';

var async = require('async');
var memoryCache = require('memory-cache');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var stattitude = require('../../lib/stattitude');

var weekArrayCacheTime = 60 * 60 * 1000; // 1h

// Get page
exports.page = function(req, res, callback) {
    res.locals.title = 'Statistics';

    res.locals.page = 'pages/stats.html';
    res.locals.toolbar = 'toolbar/default.html';
    res.locals.activeTopMenu = 'stats';

    if (undefined !== req.query.bots)
        res.locals.bots = true;

    return callback();
};

// Should probably be cached because actually does something like 90 requests on Mongo per call
var getMongoDBWeekArray_ = function(includeBaseDate, callback) {
    if (undefined === callback) { // Means includeBaseDate is not provided
        callback = includeBaseDate;
        includeBaseDate = false;
    }

    var cachedWeekArray = memoryCache.get('mongoDbWeekArray' + (includeBaseDate ? 'WithBaseDate' : ''));
    if (cachedWeekArray)
        return callback(null, cachedWeekArray);

    var now = new Date();
    var baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - constants.statsMonthsBefore);
    var dates = [];
    var dateStrings = [];

    return async.whilst(function() { return now >= baseDate; }, function(dateCallback) {
        return mongoose.model('User').aggregate([
            { $limit: 1 },
            { $project: { weekNumber: {$week: baseDate} } },
            { $group: { _id: '$weekNumber' } },
        ], function(err, results) {
            if (err) return dateCallback(err);

            var weekNumber = results[0]._id;

            // We check for existing in array then do date + 1day because Mong has had the dumb idea to have a #53 and #0 week numbers -_-
            var found = false;
            for (var i = 0 ; dates.length > i ; ++i) {
                if (weekNumber === dates[i].week && baseDate.getFullYear() === dates[i].year) {
                    found = true;
                    break ;
                }
            }

            // If week not added yet, add it
            if (!found) {
                dates.push({
                    grain: 'week',
                    week: weekNumber,
                    year: baseDate.getFullYear(),
                    baseDate: includeBaseDate ? new Date(baseDate) : undefined,
                });
                dateStrings.push('W ' + weekNumber + ' - ' + baseDate.getFullYear());
            }

            baseDate.setDate(baseDate.getDate() + 1);
            return dateCallback(null);
        });
    }, function(err) {
        if (err) return callback(err);

        var weekArray = {
            dates: dates,
            strings: dateStrings,
        };

        memoryCache.put('mongoDbWeekArray' + (includeBaseDate ? 'WithBaseDate' : ''), weekArray, weekArrayCacheTime);
        return callback(null, weekArray);
    });
};

// Get stats from the past X days and aggregate them
var generateDayStatArray_ = function(dayCount) {
    dayCount = dayCount || (14 * constants.statsMonthsBefore);

    var baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - (dayCount - 1));
    var dates = [];

    for (var i = 0 ; dayCount > i ; ++i) {
        dates.push({
            grain: 'day',
            day: baseDate.getDate(),
            month: baseDate.getMonth() + 1,
            year: baseDate.getFullYear(),
        });

        baseDate.setDate(baseDate.getDate() + 1);
    }

    return dates;
};

// Return function to aggregate results of Stattitu.de querying
var getForEachStatFunction_ = function(stats, field, includeRobots) {
    includeRobots = includeRobots || false;

    return function(stat) {
        if (stat.hasOwnProperty('isBot') &&
            !includeRobots &&
            true === stat.isBot)
            return ;

        if (!stat[field])
            return ; // Do not compute empty results

        var found = false;
        for (var i = 0 ; !found && stats.length > i ; ++i) {
            if (stat[field] === stats[i][field]) {
                stats[i].count += stat.count;
                found = true;
            }
        }

        if (!found) {
            var result = { count: stat.count };
            result[field] = stat[field];
            stats.push(result);
        }
    };
};

exports.commentGeneralStats = function(req, res, callback) {
    return getMongoDBWeekArray_(true, function(err, dateResults) {
        if (err) return callback(err);

        var dates = dateResults.dates;
        var dateStrings = dateResults.strings;

        return require('../../lib/disqus').listPosts(function(err, posts) {
            if (err) return callback(err);

            var results = {};

            posts.forEach(function(post) {
                var date = new Date(post.createdAt);

                for (var i = 0 ; dates.length > i ; ++i) {
                    var start = dates[i].baseDate;
                    var end = new Date();
                    if (dates.length - 1 > i)
                        end = dates[i + 1].baseDate;

                    if (start <= date && date < end) {
                        if (!results[dateStrings[i]])
                            results[dateStrings[i]] = 0;
                        ++results[dateStrings[i]];
                    }
                }
            });

            var formattedResults = [];
            dateStrings.forEach(function(date) {
                formattedResults.push({
                    time: date,
                    count: results[date] || 0,
                });
            });

            return callback(null, {
                generalCommentStatistics: formattedResults,
            });
        });
    });
};

exports.pageViewGeneralStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    return getMongoDBWeekArray_(function(err, dateResults) {
        if (err) return callback(err);

        var dates = dateResults.dates;
        var dateStrings = dateResults.strings;

        var stats = [];

        var dateStringIdx = 0;
        return async.eachSeries(dates, function(date, dateCallback) {
            return stattitude.get('pageView', date, function(err, results) {
                if (err) return dateCallback(err);

                var count = 0;
                results.forEach(function(elem) {
                    if (!includeRobots && true === elem.isBot)
                        return ;
                    count += elem.count;
                });

                var formattedDate = dateStrings[dateStringIdx];
                stats.push({
                    time: formattedDate,
                    count: count,
                });

                ++dateStringIdx;

                return dateCallback();
            });
        }, function(err) {
            if (err) return callback({code: 500, message: err});

            return callback(null, { generalPageViewStatistics: stats });
        });
    });
};

exports.pageViewRouteStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    var dates = generateDayStatArray_();
    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('pageView', date, function(err, results) {
            if (err) return dateCallback(err);
            results.forEach(getForEachStatFunction_(stats, 'page', includeRobots));
            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) { return stat2.count - stat1.count; });
        return callback(null, { pageViewRouteStatistics: stats  });
    });
};

exports.pageViewReferrerStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    var dates = generateDayStatArray_();
    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('pageView', date, function(err, results) {
            if (err) return dateCallback(err);
            results.forEach(getForEachStatFunction_(stats, 'referrer', includeRobots));
            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) { return stat2.count - stat1.count; });
        return callback(null, { pageViewReferrerStatistics: stats });
    });
};

exports.pageViewBrowserStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    var dates = generateDayStatArray_();
    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('pageView', date, function(err, results) {
            if (err) return dateCallback(err);
            results.forEach(getForEachStatFunction_(stats, 'browser', includeRobots));
            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) { return stat2.count - stat1.count; });
        return callback(null, { pageViewBrowserStatistics: stats });
    });
};

exports.pageViewDeviceStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    var dates = generateDayStatArray_();
    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('pageView', date, function(err, results) {
            if (err) return dateCallback(err);
            results.forEach(getForEachStatFunction_(stats, 'device', includeRobots));
            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) { return stat2.count - stat1.count; });
        return callback(null, { pageViewDeviceStatistics: stats });
    });
};

exports.uniqueSessionGeneralStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    return getMongoDBWeekArray_(function(err, dateResults) {
        if (err) return callback(err);

        var dates = dateResults.dates;
        var dateStrings = dateResults.strings;

        var stats = [];

        var dateStringIdx = 0;
        return async.eachSeries(dates, function(date, dateCallback) {
            return stattitude.get('uniqueSession', date, function(err, results) {
                if (err) return dateCallback(err);

                var count = 0;
                results.forEach(function(elem) {
                    if (!includeRobots && true === elem.isBot)
                        return ;
                    count += elem.count;
                });

                var formattedDate = dateStrings[dateStringIdx];
                stats.push({
                    time: formattedDate,
                    count: count,
                });

                ++dateStringIdx;

                return dateCallback();
            });
        }, function(err) {
            if (err) return callback({code: 500, message: err});

            return callback(null, { generalUniqueSessionStatistics: stats });
        });
    });
};

exports.uniqueSessionRouteStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    var dates = generateDayStatArray_();
    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('uniqueSession', date, function(err, results) {
            if (err) return dateCallback(err);
            results.forEach(getForEachStatFunction_(stats, 'page', includeRobots));
            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) { return stat2.count - stat1.count; });
        return callback(null, { uniqueSessionRouteStatistics: stats });
    });
};

exports.uniqueSessionReferrerStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    var dates = generateDayStatArray_();
    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('uniqueSession', date, function(err, results) {
            if (err) return dateCallback(err);
            results.forEach(getForEachStatFunction_(stats, 'referrer', includeRobots));
            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) { return stat2.count - stat1.count; });
        return callback(null, { uniqueSessionReferrerStatistics: stats });
    });
};

exports.uniqueSessionAllStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    return stattitude.get('uniqueSession', {grain: 'all'}, function(err, results) {
        if (err)
            return callback(err);

        var count = 0;
        if (!includeRobots) {
            results.forEach(function(elem) {
                if (true === elem.isBot)
                    return ;
                count += elem.count;
            });
        }

        return callback(null, { count: count });
    });
};

exports.pageViewAllStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    return stattitude.get('pageView', {grain: 'all'}, function(err, results) {
        if (err)
            return callback(err);

        var count = 0;
        if (!includeRobots) {
            results.forEach(function(elem) {
                if (true === elem.isBot)
                    return ;
                count += elem.count;
            });
        }

        return callback(null, { count: count });
    });
};

exports.commentAllStats = function(req, res, callback) {
    var includeRobots = (req.query.bots ? true : false) || false;

    return stattitude.get('comment', {grain: 'all'}, function(err, results) {
        if (err)
            return callback(err);

        var count = 0;
        if (!includeRobots) {
            results.forEach(function(elem) {
                if (true === elem.isBot)
                    return ;
                count += elem.count;
            });
        }

        return callback(null, { count: count });
    });
};
