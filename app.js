'use strict';

// Awake
// Set environment mode; possible values: 'development', 'preproduction', 'production'
var mode = process.NODE_ENV;
if (!mode ||
    !('development' === mode || 'preproduction' === mode || 'production' === mode)) {
    process.NODE_ENV = 'development';
    mode = process.NODE_ENV;
}
// !Awake

var async               = require('async');
var cluster             = require('cluster');
var express             = require('express');
var helmet              = require('helmet');
var mongoose            = require('mongoose');
var requireDir          = require('require-dir');

var constants           = require('./lib/constants');
var printer             = require('./lib/printer');

var main = function() {
    printer.info('Started application in ' + process.NODE_ENV + ' mode');

    if (cluster.isMaster) {
        global.processId = 'Master';

        var clusterPerCpu   = ('production' === process.NODE_ENV ? 4 : 1);
        var clusterCount    = parseInt(require('os').cpus().length * clusterPerCpu);

        cluster.on('fork', function(worker) {
            printer.info('Worker #' + worker.id + ' created');
        });
        cluster.on('exit', function (worker) {
            printer.warn('Worker #' + worker.id + ' died, forking a new one');
            cluster.fork();
        });

        for (var i = 0 ; i < clusterCount ; ++i)
            cluster.fork();

        mongoose.connect(constants.databaseUri);
        mongoose.connection.on('error', function (err) {
            printer.error('Could not open DB connection: ' + err);
            mongoose.connection.close();
            return process.exit(1);
        });

        return mongoose.connection.once('open', function () {
            printer.info('Connected to DB "' + constants.databaseUri + '"');

            requireDir(__dirname + '/models/');
            printer.info('Models sync\'ed');

	    return async.series([
                // Drop old sessions if needed
                function(serieCallback) {
                    if (mongoose.connection.collections.sessions) {
                        return mongoose.connection.collections.sessions.drop(function(err) {
                            if (err) return serieCallback(err);

                            printer.info('Sessions dropped');
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
                    printer.error(err);
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
            printer.error('Could not open DB connection: ' + err);
            mongoose.connection.close();
            return process.exit(1);
        });

        return mongoose.connection.once('open', function () {
            printer.info('Connected to DB "' + constants.databaseUri + '"');
            requireDir(__dirname + '/models/');
            printer.info('Models sync\'ed');

            return runServer();
        });
    }
};

var runServer = function() {
    var serverApp = express();
    var routes = require('./controllers/_routes');

    serverApp.use('/', routes.defineFrontRoutes(serverApp, express.Router()));
    serverApp.use('/backoffice', routes.defineBackOfficeRoutes(serverApp, express.Router()));

    var port = constants.serverPort;
    serverApp.listen(port);
    printer.info('Server listening on port ' + port);
};

return main();
