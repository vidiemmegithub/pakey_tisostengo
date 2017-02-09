'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      controller = require('./specialization.controller'),
      paging = require('../../components/middleware/paging');

var router = express.Router();

router.get('/', paging, controller.indexAll);
router.get('/categories', controller.indexAllByCategories);
router.get('/categories/:name', controller.indexByCategory);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:name', auth.hasRole('admin'), controller.update);
router.delete('/:name', auth.hasRole('admin'), controller.destroy);

module.exports = router;
