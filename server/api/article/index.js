'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      controller = require('./article.controller'),
      filter = require('../../components/middleware/filter'),
      fields = require('../../components/middleware/fields'),
      sort = require('../../components/middleware/sort'),
      paging = require('../../components/middleware/paging'),
      immutables = require('../../components/middleware/mongooseImmutables');

var router = express.Router();

router.get('/', auth.isAuthenticated, filter, paging, fields, sort, controller.index);
router.get('/me', auth.ensureLogged, auth.isAuthenticated, filter, paging, fields, sort, controller.indexMe);
router.get('/all', auth.hasRole('admin'), filter, paging, fields, sort, controller.indexAll);
router.get('/followed', auth.ensureLogged, auth.isAuthenticated, filter, paging, controller.indexFollowed);
router.get('/followed/all', auth.ensureLogged, auth.isAuthenticated, filter, paging, fields, controller.indexFollowedAll);
router.get('/mostfollowed', auth.isAuthenticated, filter, controller.indexMostFollowed);
router.post('/',auth.hasRole(['editor', 'qualified']), filter, paging, fields, sort, controller.create);
router.get('/:id', auth.isAuthenticated, fields, controller.show);
router.post('/:id/comment', auth.ensureLogged, auth.isAuthenticated, controller.addComment);
router.put('/:id', auth.ensureLogged, auth.isAuthenticated, immutables(require('./article.model')), controller.update);
router.put('/:id/publish', auth.hasRole('admin'), controller.publish);
router.delete('/:id/publish', auth.hasRole('admin'), controller.unpublish);
router.delete('/:id', auth.ensureLogged, auth.isAuthenticated, controller.destroy);

module.exports = router;
