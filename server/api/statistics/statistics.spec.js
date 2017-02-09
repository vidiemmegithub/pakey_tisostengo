'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest'),
      co = require('co'),
      Message = require('../message/message.model'),
      agent = request(app);

require('should-http');

describe('Statistics API Router:', function() {

  describe('GET /api/statistics', function() {
    let _token_lucaadmin, _token_qualifiedclaudio;
  
    before(function(done) {    
      co(function*() {
        try {
          // get valid token for user: qualifiedclaudio@tsos.com
          _token_qualifiedclaudio = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'qualifiedclaudio@tsos.com', 'password': 'qualifiedclaudio'})
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  return reject(err);
                }
                resolve(res.body.token);
              });
          });
          // get valid token for user: lucaadmin@tsos.com
          _token_lucaadmin = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin'})
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  return reject(err);
                }
                resolve(res.body.token);
              });
          });
          yield Message.remove();
          yield Message.create([
            {
              type: 'abuse',
              url: 'http://' + process.env.DOMAIN + '/articolo/',
              text: 'lorem ipsum',
              firstname: 'Isaac',
              lastname: 'Newton',
              email: 'isaac@infn.it'
            },
            {
              type: 'information',
              text: 'lorem ipsum',
              firstname: 'Isaac',
              lastname: 'Newton',
              email: 'isaac@infn.it'
            },
            {
              type: 'technical',
              text: 'lorem ipsum',
              firstname: 'Isaac',
              lastname: 'Newton',
              email: 'isaac@infn.it'
            }
          ]);
          
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    after(function(done) {
      Message.remove({}, done);
    });
    
    it('should kick back without a valid token', function (done) {
      agent
        .get('/api/statistics')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should kick back for a non admin user', function (done) {
      agent
        .get('/api/statistics')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });  
    it('should respond with JSON', function (done) {
      agent
        .get('/api/statistics')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          
          done();
        });
    });
    it('should respond with correct data', function (done) {
      agent
        .get('/api/statistics')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.should.have.property('statistics');
          res.body.statistics.should.have.property('user');
          res.body.statistics.user.should.have.property('qualifiedApproved', 5);
          res.body.statistics.user.should.have.property('qualifiedNotApproved', 0);
          res.body.statistics.user.should.have.property('unqualified', 2);
          res.body.statistics.should.have.property('article');
          res.body.statistics.article.should.have.property('qualified', 12);
          res.body.statistics.article.should.have.property('editorial', 4);
          res.body.statistics.should.have.property('question');
          res.body.statistics.question.should.have.property('answered', 7);
          res.body.statistics.question.should.have.property('notAnswered', 3);
          res.body.statistics.should.have.property('message');
          res.body.statistics.message.should.have.property('pendingInformation', 1);
          res.body.statistics.message.should.have.property('pendingTechnical', 1);
          res.body.statistics.message.should.have.property('pendingAbuse', 1);
          
          done();
        });
    });
  });
});
