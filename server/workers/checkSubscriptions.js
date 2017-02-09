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

const WORKER_EXECUTION_DELAY = '0 0 23 * * *',
      
      config = require('../config/environment'),
      Worker = require('./base/worker'),
      User = require('../api/user/user.model'),
      braintree = require("braintree"),
      gateway = braintree.connect({
        environment: config.braintree.environment,
        merchantId: config.braintree.merchantId,
        publicKey: config.braintree.publicKey,
        privateKey: config.braintree.privateKey
      });
    
module.exports = class CheckSubscriptions extends Worker {
  constructor() {
    super("checkSubscriptions", WORKER_EXECUTION_DELAY);
  }
  work() {
    super.work();
    User.find({'subscriptions.deactivation_date': null}, {firstname: true, subscriptions: true}, (err, users) => {
      if (err) {
        console.log(err);
        return;
      }
      users.forEach(user => {
        user.subscriptions.forEach(subscription => {
          if (!subscription.subscriptionId) {
            return;
          }
          gateway.subscription.find(subscription.subscriptionId, function (err, braintreeSubscription) {
            if (err) {
              return;
            }
            
            console.log(`check subscription for user ${user.firstname}`, braintreeSubscription.status);
            if(braintreeSubscription.status === braintree.Subscription.Status.Canceled) {
              console.log("disable subscription", subscription.id);
              subscription.deactivate();
              user.markModified('subscriptions');
              user.save();
            }
          });
        });
      });
    });
  }
};