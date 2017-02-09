'use strict';

const User = require('./user/user.model'),
      config = require('../config/environment'),
      express = require('express'),
      _ = require('lodash'),
      auth = require('../auth/auth.service'),
      co = require('co'),
      router = express.Router(),
      braintree = require("braintree"),
      gateway = braintree.connect({
        environment: config.braintree.environment,
        merchantId: config.braintree.merchantId,
        publicKey: config.braintree.publicKey,
        privateKey: config.braintree.privateKey
      });

router.get('/users/:id', function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    res.status(200).json(user);
  });
});
router.post('/users/:id/subscriptions', function(req, res) {
  co(function*() {
    let _subscription = (_.isArray(req.body)) ? req.body[0] : req.body,
        _user;

    try {
      _user = yield User.findById(req.params.id, {subscriptions: true});
      _user.subscriptions.push(_subscription);

      return res.status(200).json(yield _user.save());
    }
    catch(err) {
      console.log(err);
      return res.status(500).send(err.name + ": " + err.message);
    }
  });
});
router.get('/users/:id/subscriptions/:subname/checkState', function(req, res) {
  co(function*() {
    let _user;

    try {
      _user = yield User.findById(req.params.id);
      return res.status(200).json(_user.checkSubscriptionsState(req.params.subname));
    }
    catch(err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });
});

router.post('/payment/braintree/subscription/:subscription', auth.ensureLogged, auth.isAuthenticated, function(req, res) {
  // check user existence
  User.findById(req.user._id, function(err, user) {
    let _subscription;
    
    if (err || !user) {
      res.status(400).send("User not found");
    }
    if (!user.subscriptions || user.subscriptions.length <= 0) {
      res.status(400).send("User does not have subscriptions");
    }
    _subscription = user.subscriptions.find(sub => sub.name === req.params.subscription)[0];
    if (_subscription.length <= 0) {
      res.status(400).send("User does not have a subscription");
    }
    
    if (!user.payment) {
      user.payment = { braintree: {} };
    }
    if (!user.payment.braintree) {
      user.payment.braintree = {};
    }
    co(function*() {
      try {
        if (!user.payment.braintree.customerId) {
          // create a new user and store customerId
          console.log("create a braintree user");
          user.payment.braintree.customerId = yield new Promise((resolve, reject) => {
            gateway.customer.create({
              firstName: user.firstname,
              lastName: user.lastname,
              email: user.email
            }, function (err, result) {
              if (err) {
                return reject(err);
              }
              resolve(result.customer.id);
            });
          });
        }
        if (!user.payment.braintree.paymentMethodToken) {
          // create a user MasterCard payment method
          console.log("create a user MasterCard payment method");
          user.payment.braintree.paymentMethodToken = yield new Promise((resolve, reject) => {
            gateway.paymentMethod.create({
              customerId: user.payment.braintree.customerId,
              paymentMethodNonce: 'fake-valid-mastercard-nonce',
              options: {
                verifyCard: true,
                makeDefault: true
              }
            }, function (err, result) {
              if (err) {
                return reject(err);
              }
              resolve(result.creditCard.token);
            });
          });
        }
                
        console.log("init the subscription to plan:", req.params.planId);
        _subscription = yield new Promise((resolve, reject) => {
          gateway.subscription.create({
            paymentMethodToken: user.payment.braintree.paymentMethodToken,
            planId: req.params.planId,
            discounts: req.body.discounts
          }, function (err, result) {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
        
        user.subscriptions()
        yield user.save();
        res.status(200).json();
      }
      catch(e) {
        console.log(e);
        res.status(500).json(e);
      }
    });
  });
});

module.exports = router;
