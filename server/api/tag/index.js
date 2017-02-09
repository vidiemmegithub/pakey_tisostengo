'use strict';

const express = require('express'),
      controller = require('./tag.controller'),
      paging = require('../../components/middleware/paging');

var router = express.Router();

router.get('/', paging, controller.index);
router.get('/:userId', paging, controller.indexByUser);

module.exports = router;
