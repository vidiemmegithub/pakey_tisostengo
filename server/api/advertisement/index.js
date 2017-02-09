'use strict';

const express = require('express'),
  controller = require('./advertisement.controller'),
  auth = require('../../auth/auth.service');

var router = express.Router();
var adminRouter = express.Router();

router.get('/', auth.tryAuthenticate, controller.show);

router.use('/admin', adminRouter);

adminRouter.all(auth.hasRole('admin'));
adminRouter.get('/', controller.list);
adminRouter.post('/', controller.create);
adminRouter.put('/:id', controller.update);
adminRouter.put('/:id/enable', controller.enable);
adminRouter.delete('/:id/enable', controller.disable);
adminRouter.delete('/:id', controller.remove);

module.exports = router;
