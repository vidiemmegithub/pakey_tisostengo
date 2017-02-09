/**
 * Main application file
 */

'use strict';

const express = require('express'),
      mongoose = require('mongoose'),
      config = require('./config/environment'),
      app = express(),
      httpServer = require('http').createServer(app),
      worker = require('./worker');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB connection error: ' + err);
    worker.stopAll();
    process.exit(-1);
	}
);

// Setup server
require('./config/express')(app);
require('./routes')(app);

// Start workers
  worker.init(function() {
    this.start((process.env.WORKERS) ? process.env.WORKERS.split(',') : []);
  });

// Start server
httpServer.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
