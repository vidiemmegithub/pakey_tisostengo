'use strict';

const express = require('express'),
      picturesController = require('./pictures/pictures.controller');

var router = express.Router();

router.get('/pictures/:collection/:assetId', picturesController.index);

module.exports = router;
