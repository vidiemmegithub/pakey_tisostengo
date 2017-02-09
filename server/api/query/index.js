'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      filter = require('../../components/middleware/filter'),
      paging = require('../../components/middleware/paging'),
      controller = require('./query.controller');

var router = express.Router();

router.post('/content', auth.isAuthenticated, filter, paging, controller.searchContent);
router.post('/users', auth.isAuthenticated, paging, filter, controller.searchUsers);
router.post('/users/premium', auth.ensureLogged, auth.isAuthenticated, controller.searchPremiumUsers);

module.exports = router;
