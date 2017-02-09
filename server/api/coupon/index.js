'use strict';

const express = require('express'),
      controller = require('./coupon.controller'),
      filter = require('../../components/middleware/filter'),
      fields = require('../../components/middleware/fields'),
      sort = require('../../components/middleware/sort'),
      paging = require('../../components/middleware/paging'),
      auth = require('../../auth/auth.service'),
      immutables = require('../../components/middleware/mongooseImmutables');

var router = express.Router();

router.get('/', auth.hasRole('admin'), filter, fields, sort, paging, auth.isAuthenticated, controller.list);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), immutables(require('./coupon.model')), controller.edit);
router.delete('/:id', auth.hasRole('admin'), controller.remove);
router.get('/verify/:text/:service', auth.ensureLogged, auth.isAuthenticated, controller.verify);

module.exports = router;
