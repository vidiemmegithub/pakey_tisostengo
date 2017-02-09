'use strict';

const express = require('express'),
      auth = require('../../auth/auth.service'),
      paging = require('../../components/middleware/paging'),
      fields = require('../../components/middleware/fields'),
      controller = require('./comment.controller');

var router = express.Router();

router.get('/', auth.ensureLogged, auth.isAuthenticated, controller.indexByUser);
router.get('/articles', auth.ensureLogged, auth.isAuthenticated, paging, fields, controller.indexArticlesByUser);
router.get('/questions', auth.ensureLogged, auth.isAuthenticated, paging, fields, controller.indexQuestionsByUser);
router.post('/:collection/:id', auth.ensureLogged, auth.isAuthenticated, controller.addToCollection);
router.delete('/:id', auth.ensureLogged, auth.isAuthenticated, controller.remove);

module.exports = router;
