'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest'),
      co = require('co'),
      Article = require('../article/article.model'),
      Question = require('../question/question.model'),
      User = require('../user/user.model'),
      agent = request(app);

describe('query API', function() {
  describe('POST /api/query/content', function () {
    
    it('should kick back if posted without data', function (done) {
      agent
        .post('/api/query/content')
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Invalid query criteria");
          done();
        });
    });
    it('should respond with JSON array', function (done) {
      agent
        .post('/api/query/content')
        .send({string: "soffro"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.questions.should.be.an.Array();
          done();
        });
    });
    it('should respond if no query is passed', function (done) {
      agent
        .post('/api/query/content')
        .send({string: ""})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.questions.should.be.an.Array();
          done();
        });
    });
    it('should respond only with paginated articles', function (done) {
      agent
        .post('/api/query/content')
        .query({ type: 'articles', page: 0, per_page: 2 })
        .send({string: "aliquam"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.have.length(2);
          done();
        });
    });
    it('should respond only with paginated questions', function (done) {
      agent
        .post('/api/query/content')
        .query({ type: 'questions', page: 0, per_page: 2 })
        .send({string: "soffro"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.questions.should.be.an.Array();
          res.body.questions.should.have.length(2);
          res.body.questions[0].target_user.should.have.properties(['title', 'firstname', 'lastname', 'specialization', 'city']);
          done();
        });
    });
    it('should accept query parameter to extend filtering of content', function (done) {
      agent
        .post('/api/query/content')
        .query({ q: 'editorial:true' })
        .send({string: "aliquam"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.articles.should.have.length(3);
          done();
        });
    });
  });
  
  describe('POST /api/query/users', function () {
  
    it('should kick back if posted without data', function (done) {
      agent
        .post('/api/query/users')
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Invalid query criteria");
          done();
        });
    });
    it('should respond with JSON array', function (done) {
      agent
        .post('/api/query/users')
        .send({string: "estetica"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          done();
        });
    });
    it('should respond if no query is passed', function (done) {
      agent
        .post('/api/query/users')
        .send({string: ""})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(0);
          done();
        });
    });
    it('should respond with the requested users', function (done) {
      agent
        .post('/api/query/users')
        .send({string: "estetica"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.users.should.have.length(1);
          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .post('/api/query/users')
        .query({ page: 0, per_page: 2 })
        .send({string: "aliquam"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(2);
          done();
        });
    });
    it('should accept query parameter to extend filtering of user', function (done) {
      agent
        .post('/api/query/users')
        .query({q: 'city:Verona'})
        .send({string: "aliquam"})
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.users.should.have.length(1);
          done();
        });
    });
  });

  describe('POST /api/query/users/premium', function () {
    let _token_qualifiedclaudio;

    before(function (done) {
      co(function*() {
        // get valid token for user: qualifiedclaudio@tsos.com
        _token_qualifiedclaudio = yield new Promise((resolve, reject) => {
          agent
            .post('/auth/local')
            .send({ 'email': 'qualifiedclaudio@tsos.com', 'password': 'qualifiedclaudio' })
            .type('application/json')
            .end((err, res) => {
              if (err) {
                reject(err);
              }
              resolve(res.body.token);
            });
        });

        done();
      });
    });

    it('should kick back without a valid token', function (done) {
      agent
        .post('/api/query/users/premium')
        .type('json')
        .send({string: "estetica"})
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should kick back if posted without data', function (done) {
      agent
        .post('/api/query/users/premium')
        .type('json')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Invalid query criteria");
          done();
        });
    });
    it('should respond with JSON array', function (done) {
      agent
        .post('/api/query/users/premium')
        .send({string: "estetica"})
        .type('json')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          done();
        });
    });
    it('should respond if no query is passed', function (done) {
      agent
        .post('/api/query/users/premium')
        .send({string: ""})
        .type('json')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(0);
          done();
        });
    });
    it('should respond only with the requested users that have the ranking service active', function (done) {
      agent
        .post('/api/query/users/premium')
        .send({string: "angiologia"})
        .type('json')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.users.should.have.length(1);
          User.findById(res.body.users[0]._id, function(err, user) {
            
            user.checkSubscriptionsState('ranking').should.be.true();
            done();
          });
        });
    });
  });
  
});
