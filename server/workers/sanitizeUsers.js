"use strict";

/** Use CRON-lke format:
 * 
  *    *    *    *    *    *
  ┬    ┬    ┬    ┬    ┬    ┬
  │    │    │    │    │    |
  │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
  │    │    │    │    └───── month (1 - 12)
  │    │    │    └────────── day of month (1 - 31)
  │    │    └─────────────── hour (0 - 23)
  │    └──────────────────── minute (0 - 59)
  └───────────────────────── second (0 - 59, OPTIONAL)
*/

const WORKER_EXECUTION_DELAY = '0 0 3 * * *',
      USER_REMINDER_DELAY = '7 days',
      
      config = require('../config/environment'),
      fs = require('fs'),
      ms = require('ms'),
      _ = require('lodash'),
      nodemailer = require('nodemailer'),
      transport = nodemailer.createTransport(config.email),
      Worker = require('./base/worker'),
      User = require('../api/user/user.model');
    
module.exports = class SanitizeUsers extends Worker {
  constructor() {
    super("sanitizeUsers", WORKER_EXECUTION_DELAY);
  }
  work() {
    let _emailTemplate = _.template(fs.readFileSync('server/templates/registration_reminder_email.html', 'utf-8')),
        _now = new Date(),
        _now_from = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 0, 0, 0),
        _now_to = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 23, 59, 59);
    
    super.work();
    //console.log('check user registrated before', new Date(_now_to.getTime()-ms(USER_REMINDER_DELAY)), 'and after', new Date(_now_from.getTime()-ms(USER_REMINDER_DELAY)));
    User.find({enablingToken: {'$ne': ''}, reg_date: {'$lt': new Date(_now_to-ms(USER_REMINDER_DELAY)), '$gt': new Date(_now_from-ms(USER_REMINDER_DELAY))}}, {email: true, firstname: true, enablingToken: true}, (err, pendingUsers) => {
      pendingUsers.forEach(user => {
        //console.log("found:", user.firstname);
        transport.sendMail({
          from: config.email.registrationEmailSender,
          to: user.email,
          subject: 'Promemoria registrazione a TiSOStengo',
          html: _emailTemplate(_.merge({}, user.toObject(), {domain: config.domain}))
        });
      });
    });
  }
};