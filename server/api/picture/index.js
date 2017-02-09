'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      controller = require('./picture.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:name', controller.indexName);
router.get('/manage/move', auth.hasRole('admin'), controller.moveImages);
router.post('/', controller.create);
router.put('/:name', auth.ensureLogged, auth.isAuthenticated, controller.update);
router.delete('/:name', auth.ensureLogged, auth.isAuthenticated, controller.destroy);

module.exports = router;
