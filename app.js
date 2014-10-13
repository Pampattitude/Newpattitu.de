'use strict';

var async               = require('async');
var cluster             = require('cluster');
var express             = require('express');
var helmet              = require('helmet');
var mongoose            = require('mongoose');
var requireDir          = require('require-dir');

var console             = require('./lib/console');
var constants           = require('./lib/constants');

if (cluster.isMaster) {
    global.processId = 'Master';

    var clusterPerCpu   = ('production' == process.NODE_ENV ? 4 : 1);
    var clusterCount    = parseInt(require('os').cpus().length * clusterPerCpu);

    cluster.on('fork', function(worker) {
        console.info('Worker #' + worker.id + ' created');
    });
    cluster.on('exit', function (worker) {
        console.warn('Worker #' + worker.id + ' died, forking a new one');
        cluster.fork();
    });

    for (var i = 0 ; i < clusterCount ; ++i)
        cluster.fork();

    mongoose.connect(constants.databaseUri);
    mongoose.connection.on('error', function (err) {
        console.error('Could not open DB connection: ' + err);
        mongoose.connection.close();
        return process.exit(1);
    });

    return mongoose.connection.once('open', function () {
        console.info('Connected to DB "' + constants.databaseUri + '"');

        requireDir(__dirname + '/models/');
        console.info('Models sync\'ed');

	return async.series([
            // Drop old sessions if needed
            function(serieCallback) {
                if (mongoose.connection.collections['sessions']) {
                    return mongoose.connection.collections['sessions'].drop(function(err) {
                        if (err) return serieCallback(err);

                        console.info('Sessions dropped');
                        return serieCallback();
                    });
                }

                return serieCallback();
            },
            // Launch daemons
            function(serieCallback) {
                // TODO (Pampa): implement daemons
                return serieCallback();
            },
	], function(err) {
            if (err) {
                console.error(err);
                return process.exit(1);
            }

            return ; // Return nothing, app will stay alive because of open database connection
        });
    });
}
else {
    global.processId = 'Worker #' + cluster.worker.id;

    mongoose.connect(constants.databaseUri);
    mongoose.connection.on('error', function (err) {
        console.error('Could not open DB connection: ' + err);
        mongoose.connection.close();
        return process.exit(1);
    });

    return mongoose.connection.once('open', function () {
        console.info('Connected to DB "' + constants.databaseUri + '"');
        requireDir(__dirname + '/models/');
        console.info('Models sync\'ed');
    });
}
