/**
 * Main application routes
 */

'use strict';

const mustRevalidate = require('./components/middleware/mustRevalidate'),
      path = require('path');

module.exports = function (app) {

  // Insert routes below

  // this is a workaround for IE which does not try to revalidate
  // cache although Express sends Etag header with all get responses
  app.use('/api', mustRevalidate);

  app.use('/api/statistics', require('./api/statistics'));
  app.use('/api/advertisements', require('./api/advertisement'));
  app.use('/api/upload', require('./api/upload'));
  app.use('/api/questions', require('./api/question'));
  app.use('/api/articles', require('./api/article'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/tags', require('./api/tag'));
  app.use('/api/comments', require('./api/comment'));
  app.use('/api/assets', require('./api/assets'));
  app.use('/api/query', require('./api/query'));
  app.use('/api/messages', require('./api/message'));
  app.use('/api/payments', require('./api/payment'));
  app.use('/api/coupons', require('./api/coupon'));
  app.use('/api/carepaths', require('./api/carepath'));
  app.use('/api/pictures', require('./api/picture'));
  app.use('/api/specializations', require('./api/specialization'));

  if (process.env.NODE_ENV === 'development') {
    app.use('/dev', require('./api/dev'));
  }

  app.use('/auth', require('./auth'));

  app.use('/articolo/:id', function (req, res, next) {
    if (req.headers['user-agent'].includes('facebook')) {
      console.log("FB crawler request, serve META injected vitaminized page.");
      require('./api/article/article.controller').share.apply(this, arguments);
    }
    else {
      next();
    }
  });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function (req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
