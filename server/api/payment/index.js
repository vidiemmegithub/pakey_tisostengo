'use strict';

const express = require('express');

var router = express.Router();

//router.use('/paypal', require('./paypal'));
router.use('/braintree', require('./braintree'));

module.exports = router;
