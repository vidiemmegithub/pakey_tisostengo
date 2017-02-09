'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      controller = require('./message.controller'),
      immutables = require('../../components/middleware/mongooseImmutables'),
      filter = require('../../components/middleware/filter'),
      paging = require('../../components/middleware/paging');

var router = express.Router();

router.get('/', auth.hasRole('admin'), paging, filter, controller.index);
router.get('/:id/resolve', auth.hasRole('admin'), immutables(require('./message.model')), controller.resolve);
router.post('/', controller.create);

module.exports = router;
