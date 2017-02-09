'use strict';

const express = require('express'),
      controller = require('./user.controller'),
      auth = require('../../auth/auth.service'),
      filter = require('../../components/middleware/filter'),
      fields = require('../../components/middleware/fields'),
      sort = require('../../components/middleware/sort'),
      paging = require('../../components/middleware/paging'),
      immutables = require('../../components/middleware/mongooseImmutables'),
      timeout = require('connect-timeout');

var router = express.Router();

router.get('/', filter, paging, fields, sort, controller.index);
router.get('/all', auth.hasRole('admin'), filter, paging, fields, sort, controller.indexAll);
router.post('/specialists', controller.getSpecialists);
router.get('/requested/', paging, fields, sort, controller.indexRequested);
router.get('/followed/', paging, fields, sort, controller.indexFollowed);
router.get('/resetPassword', controller.resetPassword);
router.post('/', auth.isAuthenticated, controller.create);

router.get('/me', auth.ensureLogged, auth.isAuthenticated, (req, res, next) => { req.params.id = req.user._id; next(); }, fields, controller.show);
router.put('/me', auth.ensureLogged, auth.isAuthenticated, (req, res, next) => { req.params.id = req.user._id; next(); }, immutables(require('./user.model')), fields, controller.edit);
router.get('/me/followed', auth.ensureLogged, auth.isAuthenticated, filter, paging, fields, sort, controller.indexUserMeFollowed);
router.put('/me/followed', auth.ensureLogged, auth.isAuthenticated, controller.addFollowed);
router.put('/me/removefollowed', auth.ensureLogged, auth.isAuthenticated, controller.removeFollowed);

router.get('/validate/:enablingToken', controller.confirmRegistration);

router.get('/:id/followed', auth.isAuthenticated, filter, paging, fields, sort, controller.indexUserFollowed);
router.get('/:id', auth.isAuthenticated, fields, controller.show);
router.put('/:id', auth.hasRole('admin'), immutables(require('./user.model')), fields, controller.edit);
router.put('/:id/validateRegistration', auth.hasRole('admin'), controller.validateUQRegistration);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/:id/ban', auth.hasRole('admin'), controller.banUser);

router.post('/import', timeout('300s'), auth.hasRole('admin'), controller.import);

module.exports = router;
