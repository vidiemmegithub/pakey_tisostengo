'use strict';

const express = require('express'),
      controller = require('./statistics.controller'),
      auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);

module.exports = router;
