"use strict";

const util = require('util'),
      fs = require('fs');
        
var workers = new Map();
module.exports = {
  initialized: false,

  startAll: function() {
    if (this.initialized) {
      for(let worker of workers.values()) {
        worker.start();
      }
    }
  },
  stopAll: function() {
    for(let worker of workers.values()) {
      worker.stop();
    }
  },
  start: function(requestedworkers) {
    if (this.initialized) {
      if ("string" === typeof requestedworkers) {
        if (workers.has(requestedworkers)) {
          workers.get(requestedworkers).start();
        }
      }
      else if (util.isArray(requestedworkers)) {
        requestedworkers.forEach(requestedworker => {
          if (workers.has(requestedworker)) {
            workers.get(requestedworker).start();
          }
        });
      }
    }
  },
  
  init: function(callback, scope) {
    if(!this.initialized) {
      fs.readdir('server/workers', (err, workerFiles) => {
        if(workerFiles.length > 0) {
          workerFiles.forEach((workerFile) => {
            let worker;
            
            if(new RegExp('.js$').test(workerFile)) {
              worker = new (require('./workers/'+workerFile))();
          
              workers.set(worker.name, worker);
            }
          });
          this.initialized = true;
          
          callback.call(scope || this);
        }
      });
    }
  }
}
