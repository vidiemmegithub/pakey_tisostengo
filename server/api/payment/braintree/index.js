'use strict';

const express = require('express'),
      auth = require('../../../auth/auth.service'),
      controller = require('./braintree.controller');

var router = express.Router();

router.get('/token', auth.ensureLogged, auth.isAuthenticated, controller.getClientToken);
router.get('/plans', controller.getPlans);
router.get('/addresses', auth.ensureLogged, auth.isAuthenticated, controller.getAddresses);
router.get('/paymentMethods', auth.ensureLogged, auth.isAuthenticated, controller.getPaymentMethods);
router.post('/subscription/:subscriptionName', auth.ensureLogged, auth.isAuthenticated, controller.initSubscription);
router.delete('/subscription/:subscriptionName', auth.ensureLogged, auth.isAuthenticated, controller.removeSubscription);

module.exports = router;
