'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var stattitude = require('../../lib/stattitude');
var printer = require('../../lib/printer');
var utils = require('../../lib/utils');

// Get page
exports.page = function(req, res, callback) {
    res.locals.title = 'Statistics';

    res.locals.page = 'pages/stats.html';
    res.locals.toolbar = 'toolbar/default.html';
    res.locals.activeTopMenu = 'stats';

    return callback();
};

var getMongoDBWeekArray_ = function(callback) {
    var now = new Date();
    var baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - constants.statsMonthsBefore);
    var dates = [];
    var dateStrings = [];

    return async.whilst(function() { return now > baseDate; }, function(dateCallback) {
        return mongoose.model('User').aggregate([
            { $limit: 1 },
            { $project: { weekNumber: {$week: baseDate} } },
            { $group: { _id: '$weekNumber' } },
        ], function(err, results) {
            if (err) return dateCallback(err);

            var weekNumber = results[0]._id;
            dates.push({
                grain: 'week',
                week: weekNumber,
                year: baseDate.getFullYear(),
            });
            dateStrings.push('W ' + weekNumber + ' - ' + baseDate.getFullYear());

            baseDate.setDate(baseDate.getDate() + 7);
            return dateCallback(null);
        });
    }, function(err) {
        if (err) return callback(err);

        return callback(null, {
            dates: dates,
            strings: dateStrings,
        });
    });
};

exports.commentGeneralStats = function(req, res, callback) {
    return getMongoDBWeekArray_(function(err, dateResults) {
        if (err) return callback(err);

        var dates = dateResults.dates;
        var dateStrings = dateResults.strings;

        var stats = [];

        var dateStringIdx = 0;
        return async.eachSeries(dates, function(date, dateCallback) {
            return stattitude.get('comment', date, function(err, results) {
                if (err) return dateCallback(err);

                var count = 0;
                results.forEach(function(stat) {
                    count += stat.count;
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

            return callback(null, {
                generalCommentStatistics: stats,
            });
        });
    });
};

exports.pageViewGeneralStats = function(req, res, callback) {
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
                results.forEach(function(stat) {
                    count += stat.count;
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

            return callback(null, {
                generalPageViewStatistics: stats,
            });
        });
    });
};

exports.pageViewRouteStats = function(req, res, callback) {
    var baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 13);
    var dates = [];

    for (var i = 0 ; 14 > i ; ++i) { // Get stats from the past 14 days and aggregate them
        dates.push({
            grain: 'day',
            day: baseDate.getDate(),
            month: baseDate.getMonth() + 1,
            year: baseDate.getFullYear(),
        });

        baseDate.setDate(baseDate.getDate() + 1);
    }

    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('pageView', date, function(err, results) {
            if (err) return dateCallback(err);

            results.forEach(function(stat) {
                var found = false;
                for (var i = 0 ; !found && stats.length > i ; ++i) {
                    if (stat.page == stats[i].page) {
                        stats[i].count += stat.count;
                        found = true;
                    }
                }

                if (!found) {
                    stats.push({
                        page: stat.page,
                        count: stat.count,
                    });
                }
            });

            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) {
            return stat2.count - stat1.count;
        });
        return callback(null, {
            pageViewRouteStatistics: stats,
        });
    });
};

exports.pageViewReferrerStats = function(req, res, callback) {
    var baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 13);
    var dates = [];

    for (var i = 0 ; 14 > i ; ++i) { // Get stats from the past 14 days and aggregate them
        dates.push({
            grain: 'day',
            day: baseDate.getDate(),
            month: baseDate.getMonth() + 1,
            year: baseDate.getFullYear(),
        });

        baseDate.setDate(baseDate.getDate() + 1);
    }

    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('pageView', date, function(err, results) {
            if (err) return dateCallback(err);

            results.forEach(function(stat) {
                if (!stat.referrer)
                    return ; // Do not count empty referrer

                var found = false;
                for (var i = 0 ; !found && stats.length > i ; ++i) {
                    if (stat.referrer == stats[i].referrer) {
                        stats[i].count += stat.count;
                        found = true;
                    }
                }

                if (!found) {
                    stats.push({
                        referrer: stat.referrer,
                        count: stat.count,
                    });
                }
            });

            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) {
            return stat2.count - stat1.count;
        });
        return callback(null, {
            pageViewReferrerStatistics: stats,
        });
    });
};

exports.uniqueSessionGeneralStats = function(req, res, callback) {
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
                results.forEach(function(stat) {
                    count += stat.count;
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

            return callback(null, {
                generalUniqueSessionStatistics: stats,
            });
        });
    });
};

exports.uniqueSessionRouteStats = function(req, res, callback) {
    var baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 13);
    var dates = [];

    for (var i = 0 ; 14 > i ; ++i) { // Get stats from the past 14 days and aggregate them
        dates.push({
            grain: 'day',
            day: baseDate.getDate(),
            month: baseDate.getMonth() + 1,
            year: baseDate.getFullYear(),
        });

        baseDate.setDate(baseDate.getDate() + 1);
    }

    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('uniqueSession', date, function(err, results) {
            if (err) return dateCallback(err);

            results.forEach(function(stat) {
                var found = false;
                for (var i = 0 ; !found && stats.length > i ; ++i) {
                    if (stat.page == stats[i].page) {
                        stats[i].count += stat.count;
                        found = true;
                    }
                }

                if (!found) {
                    stats.push({
                        page: stat.page,
                        count: stat.count,
                    });
                }
            });

            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) {
            return stat2.count - stat1.count;
        });
        return callback(null, {
            uniqueSessionRouteStatistics: stats,
        });
    });
};

exports.uniqueSessionReferrerStats = function(req, res, callback) {
    var baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 13);
    var dates = [];

    for (var i = 0 ; 14 > i ; ++i) { // Get stats from the past 14 days and aggregate them
        dates.push({
            grain: 'day',
            day: baseDate.getDate(),
            month: baseDate.getMonth() + 1,
            year: baseDate.getFullYear(),
        });

        baseDate.setDate(baseDate.getDate() + 1);
    }

    var stats = [];

    return async.eachSeries(dates, function(date, dateCallback) {
        return stattitude.get('uniqueSession', date, function(err, results) {
            if (err) return dateCallback(err);

            results.forEach(function(stat) {
                if (!stat.referrer)
                    return ; // Do not count empty referrer

                var found = false;
                for (var i = 0 ; !found && stats.length > i ; ++i) {
                    if (stat.referrer == stats[i].referrer) {
                        stats[i].count += stat.count;
                        found = true;
                    }
                }

                if (!found) {
                    stats.push({
                        referrer: stat.referrer,
                        count: stat.count,
                    });
                }
            });

            return dateCallback();
        });
    }, function(err) {
        if (err) return callback({code: 500, message: err});

        stats = stats.sort(function(stat1, stat2) {
            return stat2.count - stat1.count;
        });
        return callback(null, {
            uniqueSessionReferrerStatistics: stats,
        });
    });
};
