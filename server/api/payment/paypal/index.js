'use strict';

const express = require('express'),
      auth = require('../../../auth/auth.service'),
      controller = require('./paypal.controller');

var router = express.Router();

router.post('/initRecurring', auth.ensureLogged, auth.isAuthenticated, controller.initRecurring);

module.exports = router;
