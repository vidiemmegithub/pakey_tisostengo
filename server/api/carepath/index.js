'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      controller = require('./controller'),
      paging = require('../../components/middleware/paging');

var router = express.Router();

router.get('/', paging, controller.index);
router.get('/:id', controller.show);
router.post('/create', auth.hasRole(['admin']), controller.create);
router.post('/:id/update', auth.hasRole(['admin']), controller.update);
router.post('/:id/delete', auth.hasRole(['admin']), controller.destroy);

module.exports = router;
