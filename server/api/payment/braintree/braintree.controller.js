'use strict';

const _ = require('lodash'),
      config = require('../../../config/environment'),
      User = require('../../user/user.model'),
      Coupon = require('../../coupon/coupon.model'),
      co = require('co'),
      braintree = require("braintree"),
      gateway = braintree.connect({
        environment: config.braintree.environment,
        merchantId: config.braintree.merchantId,
        publicKey: config.braintree.publicKey,
        privateKey: config.braintree.privateKey
      });

exports.getClientToken = function(req, res) {
  // check user existence
  User.findById(req.user._id, function(err, user) {
    let clientToken, customer;
    
    co(function*() {
      try {
        if (err || !user) {
          return handleError(res, 400, "User not found");
        }
        if (!user.payment) {
          user.payment = { braintree: {} };
        }
        if (!user.payment.braintree) {
          user.payment.braintree = {};
        }
        if (!user.payment.braintree.customerId) {
          // create a new user and store customerId
          console.log("create a braintree user");
          customer = yield new Promise((resolve, reject) => {
            gateway.customer.create({
              firstName: user.firstname,
              lastName: user.lastname,
              email: user.email,
              company: user.firstname,
              phone: user.telephone,
              website: user.web
            }, function (err, result) {
              if (err) {
                return reject(err);
              }
              resolve(result.customer);
            });
          });
          user.payment.braintree.customerId = customer.id;
          user.markModified('payment.braintree.customerId');
          yield user.save();
          
          /*
          yield new Promise((resolve, reject) => {
            gateway.paymentMethod.create({
              customerId: user.payment.braintree.customerId,
              paymentMethodNonce: 'fake-valid-maestro-nonce'
            }, function (err, result) {
              if (err) {
                return reject(err);
              }
              resolve(result.creditCard.token);
            });
          });
          */
        }
        clientToken = yield new Promise((resolve, reject) => {
          gateway.clientToken.generate({}, function (err, response) {
            if (err) {
              reject(err);
            }
            
            resolve(response.clientToken);
          });
        });
        
        res.status(200).json({token: clientToken});
      }
      catch(err) {
        handleError(res, 500, err);
      }
    });
  });
};

exports.initSubscription = function(req, res) {
  let coupon, operation, paymentMethodToken;
  
  if (!config.services[req.params.subscriptionName]) {
    return handleError(res, 404, "Subscription not found");
  }
  if (!req.body.payment_method_nonce) {
    return handleError(res, 400, "Missing payment nonce. Request one using Braintree client SDK");
  }
  if (!req.body.billingDetail) {
    return handleError(res, 400, "Missing billing address");
  }
  if (!req.body.billingDetail.hasOwnProperty('firstName') ||
      !req.body.billingDetail.hasOwnProperty('lastName') ||
      !req.body.billingDetail.hasOwnProperty('company') ||
      !req.body.billingDetail.hasOwnProperty('piva') ||
      !req.body.billingDetail.hasOwnProperty('streetAddress') ||
      !req.body.billingDetail.hasOwnProperty('locality') ||
      !req.body.billingDetail.hasOwnProperty('postalCode') ||
      !req.body.billingDetail.hasOwnProperty('region') ||
      !req.body.billingDetail.hasOwnProperty('countryName')) {
    return handleError(res, 400, "Missing billing address component");
  }
    
  User.findById(req.user._id, function(err, user) {
    if (err || !user) {
      return handleError(res, 404, "User not found");
    }
    if (user.subscriptions && _.find(user.subscriptions, subscription => {
        return (subscription.name === req.params.subscriptionName && (!subscription.deactivation_date || (subscription.deactivation_date.getTime() >= Date.now())));
      }
    )) {
      return handleError(res, 400, "Utente già registrato al servizio");
    }
    
    co(function*() {
      try {           
        // create a payment method
        paymentMethodToken = yield new Promise((resolve, reject) => {
          //console.log("create a payment method for", user.payment.braintree.customerId);
          gateway.paymentMethod.create({
            customerId: user.payment.braintree.customerId,
            paymentMethodNonce: req.body.payment_method_nonce,
            billingAddress: _.omit(req.body.billingDetail, ['piva']),
            options: {
              failOnDuplicatePaymentMethod: false
            }
          }, function (err, result) {
            if (err) {
              return reject(err);
            }
            if (!result.paymentMethod) {
              return reject("Error in Payment Method creation");
            }
            resolve(result.paymentMethod.token);
          });
        });
        
        if (req.body.discount) {
          coupon = yield Coupon.findOne({text: req.body.discount});
        }
        
        operation = yield new Promise((resolve, reject) => {
          gateway.subscription.create({
            paymentMethodToken: paymentMethodToken,
            //paymentMethodNonce: req.body.payment_method_nonce,
            planId: config.services[req.params.subscriptionName].planId,
            discounts: (coupon) ? {add: [coupon.extractDiscountInformation()]} : {}
          }, function (err, result) {
            if (err) {
              return reject(err);
            }
            if (result.success !== true) {
              return reject("Error in subscription registration");
            }
            resolve(result);
          });
        });
        
        if (coupon) {
          yield new Promise((resolve, reject) => {
            coupon.use(function(err) {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });
          user.usedCoupons.push(coupon.text);
          user.markModified('usedCoupons');
        }
        
        user.subscriptions.push({
          name: req.params.subscriptionName,
          subscriptionId: operation.subscription.id,
          sold_price: operation.subscription.price,
          coupon: coupon,
          billingDetail: req.body.billingDetail
        });
        user.markModified('subscriptions');
        yield user.save();
        
        res.status(201).end();
      }
      catch(err) {
        handleError(res, 500, err);
      }
    });
  });
};

exports.removeSubscription = function(req, res) {
  let userId = req.user._id,
      subscription, operation;
  
  if (!config.services[req.params.subscriptionName]) {
    return handleError(res, 404, "Subscription not found");
  }
  
  if (req.user.role === 'admin')  {
    if(!req.query.userId) {
      return handleError(res, 400, "Missing userId parameter");
    }
    userId = req.query.userId;
  }
  
  // check user existence
  User.findById(userId, function(err, user) {
    if (err || !user) {
      return handleError(res, 400, "User not found");
    }
    if (!user.subscriptions || user.subscriptions.length <= 0) {
      return handleError(res, 400, "Utente non ancora registrato al servizio");
    }
    subscription = _.find(user.subscriptions, subscription => {
        return (subscription.name === req.params.subscriptionName && (!subscription.deactivation_date || (this.deactivation_date.getTime() >= Date.now())));
      }
    );
    
    if (!subscription) {
      return handleError(res, 400, "Utente non ancora registrato al servizio");
    }
        
    co(function*() {
      try {
        operation = yield new Promise((resolve, reject) => {
          gateway.subscription.cancel(subscription.subscriptionId, function (err, result) {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
        
        if (operation.success === true) {
          subscription.deactivate();
          user.markModified('subscriptions');
          user.save();
        }
        
        res.status(200).json({subscription: subscription});
      }
      catch(err) {
        handleError(res, 500, err);
      }
    });
  });
};

exports.getPlans = function(req, res) {
  let _res = {};
  
  gateway.plan.all(function(err, plans) {
    if (err) {
      return handleError(res, 500, err);
    }
    
    _.forEach(config.services, (val, key) => _res[key] = _.merge(_.find(plans.plans, {'id': val.planId}), {serviceType: key}))
    res.status(200).json(_res);
  });
};

exports.getPaymentMethods = function(req, res) {
  // check user existance
  User.findById(req.user._id, function(err, user) {    
    co(function*() {
      let paymentMethods = {};
      
      try {
        if (err || !user) {
          return handleError(res, 404, "User not found");
        }
        if (!user.payment || !user.payment.braintree || !user.payment.braintree.customerId) {
          return handleError(res, 400, "User does not have a Braintree profile");
        }
        
        //console.log("Get payment methods for customer:", user.payment.braintree.customerId);
        paymentMethods = yield new Promise((resolve, reject) => {
          gateway.customer.find(user.payment.braintree.customerId, function(err, customer) {
            if (err) {
              return reject(err);
            }
            
            resolve(customer.paymentMethods);
          });
        });
        
        res.status(200).json({paymentMethods: paymentMethods});
      }
      catch(err) {
        handleError(res, 500, err);
      }
    });
  });
};

exports.getAddresses = function(req, res) {
  // check user existance
  User.findById(req.user._id, function(err, user) {    
    co(function*() {
      let addresses = [];
      
      try {
        if (err || !user) {
          return handleError(res, 400, "User not found");
        }
        if (!user.payment || !user.payment.braintree || !user.payment.braintree.customerId) {
          return handleError(res, 400, "User does not have a Braintree profile");
        }
        
        //console.log("Get addresses for customer:", user.payment.braintree.customerId);
        addresses = yield new Promise((resolve, reject) => {
          gateway.customer.find(user.payment.braintree.customerId, function(err, customer) {
            if (err) {
              return reject(err);
            }
            
            resolve(customer.addresses);
          });
        });
        
        res.status(200).json({addresses: addresses});
      }
      catch(err) {
        handleError(res, 500, err);
      }
    });
  });
};

function handleError(res, code, err) {
  console.log(err);
  return res.status(code).send(err);
}
