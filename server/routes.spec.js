'use strict';

const should = require('should'),
      co = require('co'),
      app = require('./app'),
      request = require('supertest'),
      agent = request(app),
      Article = require('./api/article/article.model'),
      Question = require('./api/question/question.model');

describe('Main application server', function() {
  describe('Test main application routes', function () {

    it('should be able to connect to main app page', function (done) {
      agent
        .get('/')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          done();
        });
    });
    it('should be able to connect to articles list sub-page', function (done) {
      agent
        .get('/articoli')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          done();
        });
    });
    it('should be able to connect to an article sub-page', function (done) {
      Article.findOne({title: 'Le nuove lenti progressive'}, {_id: true}, function(err, article) {
        if (err) {
          return done(err);
        }
        agent
          .get('/articolo/'+article.id)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            done();
          });
      });
    });
    it('should be able to connect to questions list sub-page', function (done) {
      agent
        .get('/domande')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          done();
        });
    });
    it('should be able to connect to a question sub-page', function (done) {
      Question.findOne({text: 'E\' possibile che io soffra di allergia ai gatti?'}, {_id: true}, function(err, question) {
        if (err) {
          return done(err);
        }
        agent
          .get('/domanda/'+question.id)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            done();
          });
      });
    });
    it('should redirect to home for a non routed URL', function (done) {
      Question.findOne({text: 'E\' possibile che io soffra di allergia ai gatti?'}, {_id: true}, function(err, question) {
        if (err) {
          return done(err);
        }
        agent
          .get('/chisiamo')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            done();
          });
      });
    });

  });
});
