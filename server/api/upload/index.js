'use strict';

var express = require('express');
var multipart = require('connect-multiparty');
var controller = require('./upload.controller');

var router = express.Router();

//router.get('/', controller.index);
router.post('/:collection', multipart(), controller.create);

module.exports = router;
