'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest'),
      co = require('co'),
      Question = require('./question.model'),
      User = require('../user/user.model'),
      agent = request(app),
      config = require('../../config/environment');

describe('questions API', function() {
  describe('GET /api/questions', function() {

    let _qualifiedclaudio, _qualifiedavanzi, _unqualifiedcarla,
        _token_unqualifiedmassimo, _token_unqualifiedcarla;

    before(function(done) {
      co(function*() {
        try {
          _qualifiedclaudio = yield User.findOne({'email': 'qualifiedclaudio@tsos.com'});
          _qualifiedavanzi = yield User.findOne({'email': 'qualifiedavanzi@tsos.com'});
          _unqualifiedcarla = yield User.findOne({'email': 'unqualifiedcarla@tsos.com'});
          // get valid token for user: unqualifiedcarla@tsos.com
          _token_unqualifiedcarla = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'unqualifiedcarla@tsos.com', 'password': 'unqualifiedcarla'})
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                resolve(res.body.token);
              });
          });
          // get valid token for user: unqualifiedmassimo@tsos.com
          _token_unqualifiedmassimo = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'unqualifiedmassimo@tsos.com', 'password': 'unqualifiedmassimo'})
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                resolve(res.body.token);
              });
          });

          done();
        }
        catch(e) {
          done(e);
        }
      });
    });

    it('should respond with JSON array', function (done) {
      agent
        .get('/api/questions')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.questions.should.be.an.Array();
          res.body.questions.should.have.length(3);
          done();
        });
    });
    it('should return only public questions', function (done) {
      agent
        .get('/api/questions')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.body.questions.should.matchEach(function(question) {
            question.type.should.be.equal('public');
          });
          done();
        });
    });
    it('should return only answered questions', function (done) {
      agent
        .get('/api/questions')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.body.questions.should.matchEach(function(question) {
            question.should.not.have.property('answer', null);
          });
          done();
        });
    });
    it('should remove answers for non logged users', function (done) {
      agent
        .get('/api/questions')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.body.questions.should.matchEach(function(question) {
            question.should.not.have.property('answer');
          });
          done();
        });
    });
    it('should show answers to logged users', function (done) {
      agent
        .get('/api/questions')
        .set('Authorization', `Bearer ${_token_unqualifiedmassimo}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.body.questions.should.matchEach(function(question) {
            question.should.have.property('answer');
          });
          done();
        });
    });

  });

  describe('GET /api/questions/all', function () {
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
                  reject(err);
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
                  reject(err);
                }
                resolve(res.body.token);
              });
          });

          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    it('should kick back without a valid token', function (done) {
      agent
        .get('/api/questions/all')
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
        .get('/api/questions/all')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should respond with JSON array', function (done) {
      agent
        .get('/api/questions/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.questions.should.be.an.Array();
          res.body.questions.should.have.length(10);
          done();
        });
    });
    it('should return public and private questions', function (done) {
      agent
        .get('/api/questions/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.questions.should.matchEach(function(question) {
            question.type.should.be.equalOneOf(['private', 'public']);
          });

          done();
        });
    });

  });

  describe('POST /api/questions', function() {

    let _qualifiedclaudio, _qualifiedavanzi, _unqualifiedcarla,
        _token_unqualifiedmassimo, _token_unqualifiedcarla;

    before(function(done) {
      co(function*() {
        try {
          _qualifiedclaudio = yield User.findOne({'email': 'qualifiedclaudio@tsos.com'});
          _qualifiedavanzi = yield User.findOne({'email': 'qualifiedavanzi@tsos.com'});
          _unqualifiedcarla = yield User.findOne({'email': 'unqualifiedcarla@tsos.com'});
          // get valid token for user: unqualifiedcarla@tsos.com
          _token_unqualifiedcarla = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'unqualifiedcarla@tsos.com', 'password': 'unqualifiedcarla'})
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                resolve(res.body.token);
              });
          });
          // get valid token for user: unqualifiedmassimo@tsos.com
          _token_unqualifiedmassimo = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'unqualifiedmassimo@tsos.com', 'password': 'unqualifiedmassimo'})
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                resolve(res.body.token);
              });
          });

          done();
        }
        catch(e) {
          done(e);
        }
      });
    });

    it('should kick back without a valid token', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda privata', type: 'private', target_user: _qualifiedclaudio.id})
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should kick back without a target_user', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda privata'})
        .type('application/json')
        .set('Authorization', `Bearer ${_token_unqualifiedcarla}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(400);
          res.text.should.be.equal("No target user specified");
          done();
        });
    });
    it('should prevent to make a self question', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda privata', target_user: _unqualifiedcarla.id})
        .type('application/json')
        .set('Authorization', `Bearer ${_token_unqualifiedcarla}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(400);
          res.text.should.be.equal("Unable to post a question to myself");
          done();
        });
    });
    it('should post a public question', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda pubblica', target_user: _qualifiedclaudio.id})
        .type('application/json')
        .set('Authorization', `Bearer ${_token_unqualifiedmassimo}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(204);
          Question.remove({text: 'Domanda pubblica', target_user: _qualifiedclaudio.id}, done);
        });
    });
    it('should prevent to make private question if author doesn\'t have private-channel-unq subscription', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda privata', type: 'private', target_user: _qualifiedclaudio.id})
        .type('application/json')
        .set('Authorization', `Bearer ${_token_unqualifiedcarla}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should prevent to make private question if target_user doesn\'t have private-channel-uq subscription', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda privata', type: 'private', target_user: _qualifiedavanzi.id})
        .type('application/json')
        .set('Authorization', `Bearer ${_token_unqualifiedmassimo}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should prevent to make private question if neither user nor target user have private-channel-* subscription', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda privata', type: 'private', target_user: _qualifiedavanzi.id})
        .type('application/json')
        .set('Authorization', `Bearer ${_token_unqualifiedcarla}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should make a private question if both user and target_user has private-channel-* subscription', function (done) {
      agent
        .post('/api/questions')
        .send({text: 'Domanda privata', type: 'private', target_user: _qualifiedclaudio.id})
        .type('application/json')
        .set('Authorization', `Bearer ${_token_unqualifiedmassimo}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(204);

          Question.remove({text: 'Domanda privata', type: 'private', target_user: _qualifiedclaudio.id}, done);
        });
    });

  });

  describe('DELETE /api/questions/{questionId}', function() {
    let _token_unqualifiedmassimo, _token_lucaadmin, _unqualifiedmassimo, _question;

    before(function(done) {
      co(function*() {
        _unqualifiedmassimo = yield User.findOne({email: 'unqualifiedmassimo@tsos.com'});
        _question = yield Question.create({author: _unqualifiedmassimo, text: "Domanda di test"});
        _token_lucaadmin = yield new Promise((resolve, reject) => {
          agent
            .post('/auth/local')
            .send({'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin'})
            .type('application/json')
            .end((err, res) => {
              if (err) {
                reject(err);
              }
              resolve(res.body.token);
            });
        });
        // get valid token for user: unqualifiedmassimo@tsos.com
        _token_unqualifiedmassimo = yield new Promise((resolve, reject) => {
          agent
            .post('/auth/local')
            .send({'email': 'unqualifiedmassimo@tsos.com', 'password': 'unqualifiedmassimo'})
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
    after(function(done) {
      _question.remove(done);
    });

    it('should kick back without a valid token', function (done) {
      agent
        .del(`/api/questions/${_question.id}`)
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
        .del(`/api/questions/${_question.id}`)
        .set('Authorization', `Bearer ${_token_unqualifiedmassimo}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should remove question', function (done) {
      agent
        .del(`/api/questions/${_question.id}`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(204);

          agent
            .get(`/api/questions/${_question.id}`)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              res.should.have.status(400);

              done();
            });
        });
    });

  });
});
