'use strict';

// Awake
// Set environment mode; possible values: 'development', 'preproduction', 'production'
var mode = process.env.NODE_ENV;
if (!mode ||
    !('development' === mode || 'preproduction' === mode || 'production' === mode)) {
    process.env.NODE_ENV = 'development';
    mode = process.env.NODE_ENV;
}
// !Awake

var async               = require('async');
var cluster             = require('cluster');
var express             = require('express');
var mongoose            = require('mongoose');
var requireDir          = require('require-dir');

var constants           = require('./lib/constants');
var disqus              = require('./lib/disqus');
var printer             = require('./lib/printer');

if (cluster.isMaster)
    global.processId = 'Master';
else
    global.processId = 'Worker #' + cluster.worker.id;

var servicesConnect = function(callback) {
    return async.parallel([
        function(parallelCallback) {
            mongoose.connect(constants.databaseUri);
            requireDir(__dirname + '/models/');

            mongoose.connection.on('error', function(err) {
                return parallelCallback(err);
            });

            return mongoose.connection.once('open', function() {
                return parallelCallback();
            });
        },

        function(parallelCallback) {
            return disqus.connect(function() {
                // Disqus is lazy initialized, so we call listThreads() to ensure connection
                return disqus.listThreads(parallelCallback);
            });
        },
    ], callback);
};

var main = function() {
    printer.info('Started application in ' + process.env.NODE_ENV + ' mode');

    if (cluster.isMaster) {
        cluster.on('fork', function(worker) {
            printer.info('Worker #' + worker.id + ' created');
        });
        cluster.on('online', function(worker) {
            printer.info('Worker #' + worker.id + ' connected');
        });
        cluster.on('exit', function(worker) {
            printer.warn('Worker #' + worker.id + ' died, forking a new one');
            cluster.fork();
        });

        cluster.fork();

        printer.info('Initializing services...');
        return servicesConnect(function(err) {
            if (err) {
                printer.error('Could not initialize services:', err.stack);
                return process.exit(1);
            }

            printer.info('Services initialized');

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
                // MUST BE LAST, BECAUSE INFINITE LOOP
                require('./tools/daemons'),
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
        printer.info('Initializing services...');

        return servicesConnect(function(err) {
            if (err) {
                printer.error('Could not connect to services:', err.stack);
                return process.exit(1);
            }

            printer.info('Services initialized');

            // In case of a worker, run the actual Web server
            return runServer();
        });
    }
};

var runServer = function() {
    var serverApp = express();
    var serverRouter = express.Router();
    var routes = require('./controllers/_routes');

    // Settings
    if ('preproduction' == process.env.NODE_ENV)
        serverApp.set('env', 'development');
    else
        serverApp.set('env', process.env.NODE_ENV);
    serverApp.set('x-powered-by', false);

    // Rendering engine
    serverApp.engine('html', require('ejs').renderFile);
    serverApp.set('view engine', 'ejs');
    serverApp.set('views', constants.viewBasePath);

    // Global middlewares
    if ('development' == process.env.NODE_ENV)
        serverApp.use(require('morgan')('dev', {
            stream: {
                write: function(str) { return printer.info(str.replace(/[\r\n]+/g, '')); },
            },
        }));
    else
        serverApp.use(require('morgan')('dev', {
            stream: {
                write: function(str) { return printer.info(str.replace(/[\r\n]+/g, '')); },
                skip: function(req, res) { return 400 >= res.statusCode; },
            },
        }));

    var bodyParser      = require('body-parser');
    var connectMongo    = require('connect-mongo');
    var cookieParser    = require('cookie-parser');
    var expressSession  = require('express-session');
    var helmet          = require('helmet');
    var prerender       = require('prerender-node');

    // Security headers
    serverApp.use(helmet.xframe());
    serverApp.use(helmet.xssFilter());
    serverApp.use(helmet.nosniff());
    serverApp.use(helmet.nocache());

    serverApp.use(bodyParser.urlencoded({extended: true}));
    serverApp.use(bodyParser.json());
    serverApp.use(cookieParser());

    var mongoStore = require('connect-mongo')(expressSession);
    var store = new mongoStore({
        url: constants.databaseUri + '/sessions',
    }, function() {
        serverApp.use(expressSession({
            secret: constants.sessionSecret,
            resave: true,
            saveUninitialized: true,
            store: store,
        }));

        serverApp.use('/', express.static(constants.resourcePath, {
            setHeaders: function(res, path) {
                if (-1 != path.indexOf('.unity3d'))
                    res.set('Content-Type', 'application/vnd.unity');
            },
        }));
        serverApp.use(constants.backOfficeRoute, routes.defineBackOfficeRoutes(serverApp, express.Router()));
        serverApp.use(constants.frontRoute, routes.defineFrontRoutes(serverApp, express.Router()));

        var port = constants.serverPort;
        serverApp.listen(port);
        printer.info('Server listening on port ' + port);
    });
};

main();
