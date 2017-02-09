"use strict";

const   util = require('util'),
        schedule = require('node-schedule');

module.exports = class Worker {
  constructor(workername, delay) {
    this.delay = delay;
    this.name = workername;
    this.isEnabled = true;
    this.isStarted = false;
    util.log(`${this.name} worker init every ${this.delay}`);
  }
  start() {
    if (this.cronjob) {
      this.cronjob.cancel();
      this.cronjob = null;
    }
    if (this.isEnabled && !this.isStarted) {
      this.cronjob = schedule.scheduleJob(this.delay, this.work.bind(this));
      this.isStarted = true;
      util.log(`${this.name} worker start`);
    }
  }
  stop() {
    if (this.cronjob) {
      this.cronjob.cancel();
    }
    this.cronjob = null;
    this.isStarted = false;
    util.log(`${this.name} worker stopped`);
  }
  work() {
    util.log(`'${this.name}' worker do its job. Next start at ${this.cronjob.nextInvocation().toLocaleString()}`)
 }
}