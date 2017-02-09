'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      controller = require('./question.controller'),
      filter = require('../../components/middleware/filter'),
      fields = require('../../components/middleware/fields'),
      sort = require('../../components/middleware/sort'),
      paging = require('../../components/middleware/paging');

var router = express.Router();

router.get('/', auth.isAuthenticated, filter, paging, fields, sort, controller.index);
router.get('/all', auth.hasRole('admin'), filter, paging, fields, sort, controller.indexAll);
router.get('/me/outgoing', auth.ensureLogged, auth.isAuthenticated, filter, paging, fields, sort, controller.indexOutgoing);
router.get('/me/incoming', auth.ensureLogged, auth.isAuthenticated, filter, paging, fields, sort, controller.indexIncoming);
router.get('/followed', auth.ensureLogged, auth.isAuthenticated, filter, paging, controller.indexFollowed);
router.get('/mostfollowed', auth.isAuthenticated, filter, paging, controller.indexMostFollowed);
router.get('/:id', auth.isAuthenticated, fields, controller.show);
router.post('/:id/comment', auth.isAuthenticated, controller.addComment);
router.post('/:id/answer', auth.hasRole('qualified'), controller.addAnswer);
router.post('/', auth.ensureLogged, auth.isAuthenticated, controller.create);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
