'use strict';

const _ = require('lodash'),
  should = require('should'),
  app = require('../../app'),
  request = require('supertest'),
  co = require('co'),
  config = require('../../config/environment'),
  User = require('../user/user.model'),
  Article = require('../article/article.model'),
  Question = require('../question/question.model'),
  agent = request(app);

require('should-http');

describe('users API', function () {
  describe('GET /api/users', function () {

    it('should respond with JSON array', function (done) {
      agent
        .get('/api/users')
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
    it('should not contains salt, password or hashed password', function (done) {
      agent
        .get('/api/users')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.should.not.have.properties(['password', 'salt', 'hashedPassword']);
          });

          done();
        });
    });
    it('should contains only qualified users', function (done) {
      agent
        .get('/api/users')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.role.should.be.equal("qualified");
          });

          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/users?per_page=3&page=0')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(3);

          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get('/api/users?f=firstname')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.matchEach(function (user) {
            Object.keys(user).should.have.length(2);
            user.should.have.property('firstname');
          });

          done();
        });
    });

  });

  describe('GET /api/users/{userId}', function () {
    let _qualifiedclaudio, _editorfranco;
    
    before(function(done) {    
      co(function*() {
        try {
          _qualifiedclaudio = yield User.findOne({email: 'qualifiedclaudio@tsos.com'});
          _editorfranco = yield User.findOne({email: 'editorfranco@tsos.com'});
          
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
  
    it('should respond with the correct user', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.should.have.property('email', 'editorfranco@tsos.com');
          
          done();
        });
    });
    it('should not contains salt, password, hashed password or payment user details', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          res.body.should.not.have.property('password');
          res.body.should.not.have.property('salt');
          res.body.should.not.have.property('hashedPassword');
          res.body.should.not.have.property('payment');
          
          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}`)
        .query({f: 'firstname'})
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property('firstname');
          res.body.should.not.have.property('web');
          
          done();
        });
    });
    it('should show full profile info if target user has a premium-profile service', function (done) {
      agent
        .get(`/api/users/${_qualifiedclaudio.id}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          console.log(res.body.email,res.body.web);
          res.should.have.status(200);
          res.body.should.have.property('web');
          res.body.should.have.property('secondarySpecializations');
          res.body.secondarySpecializations.should.be.Array();
          res.body.should.have.property('operationalAddresses')
          res.body.operationalAddresses.should.be.Array();

          done();
        });
    });
    it('should hide full profile info if target user has not a premium-profile service', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          res.should.have.status(200);
          res.body.should.not.have.property('web');
          res.body.should.not.have.property('secondarySpecializations');
          res.body.should.not.have.property('operationalAddresses')

          done();
        });
    });
    
  });

  describe('DELETE /api/users/{userId}', function () {
    let _userFriend = new User({ email: 'userfriend@email.com', password: 'pippo', province: 'Bologna' }),
        _token_lucaadmin, _token_qualifiedclaudio;

    before(function (done) {
      co(function*() {
        yield _userFriend.save();
        _token_lucaadmin = yield new Promise((resolve, reject) => {
          agent
            .post('/auth/local')
            .send({ 'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin' })
            .type('application/json')
            .end((err, res) => {
              if (err) {
                reject(err);
              }
              resolve(res.body.token);
            });
        });
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
    after(function (done) {
      _userFriend.remove(done);
    });

    it('should kick back without a valid token', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        agent
          .del(`/api/users/${user.id}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
            res.should.have.status(403);
            user.remove(done);
          });
      });
    });
    it('should kick back for a non admin user', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        agent
          .del(`/api/users/${user.id}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
            res.should.have.status(403);
            user.remove(done);
          });
      });
    });
    it('should remove given user', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        agent
          .del(`/api/users/${user.id}`)
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
            res.should.have.status(204);
            User.findById(user.id, (err, user) => {
              should.not.exist(user);
  
              done();
            });
          });
      });
    });
    it('removed user is unable to login', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        agent
          .del(`/api/users/${user.id}`)
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
            res.should.have.status(204);
            agent
              .post('/auth/local')
              .send({ email: 'user@tsos.com', password: 'pippo' })
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(401);
  
                done();
              });
          });
      });
    });
    it('it is possible to register with the cancelled email', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        agent
          .del(`/api/users/${user.id}`)
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
            res.should.have.status(204);
            agent
              .post('/api/users')
              .send({ email: 'user@tsos.com', password: 'pippo', province: 'Bologna' })
              .type('json')
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(201);
                res.should.be.json();
                res.body.should.have.property('token');
  
  
                User.remove({ email: 'user@tsos.com' }, done);
              });
          });
      });
    });
    it('should remove all articles from the user', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        Article.create({ author: user, text: "Titolo" }, (err, article) => {
          if (err) {
            return done(err);
          }
          agent
            .del(`/api/users/${user.id}`)
            .set('Authorization', `Bearer ${_token_lucaadmin}`)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
  
              res.should.have.status(204);
              Article.find({ author: user.id }, (err, articles) => {
                articles.should.have.length(0);
  
                done();
              });
            });
        });
      });
    });
    it('should remove all questions from the user', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        Question.create({ author: user, target_user: _userFriend, text: "Titolo" }, (err, question) => {
          if (err) {
            return done(err);
          }
          agent
            .del(`/api/users/${user.id}`)
            .set('Authorization', `Bearer ${_token_lucaadmin}`)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
  
              res.should.have.status(204);
              Question.find({ author: user.id }, (err, questions) => {
                questions.should.have.length(0);
  
                done();
              });
            });
        });
      });
    });
    it('should remove all questions to the user', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        Question.create({ author: _userFriend, target_user: user, text: "Titolo" }, (err, question) => {
          if (err) {
            return done(err);
          }
          agent
            .del(`/api/users/${user.id}`)
            .set('Authorization', `Bearer ${_token_lucaadmin}`)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
  
              res.should.have.status(204);
              Question.find({ target_user: user }, (err, questions) => {
                questions.should.have.length(0);
  
                done();
              });
            });
        });
      });
    });
    it('should remove all comments by the user', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        co(function*() {
          try {
            yield Article.create({
              author: _userFriend,
              text: "Titolo",
              comments: [{ author: user, text: "Commento" }]
            });
            yield Question.create({
              author: _userFriend,
              text: "Titolo",
              comments: [{ author: user, text: "Commento" }]
            });
            agent
              .del(`/api/users/${user.id}`)
              .set('Authorization', `Bearer ${_token_lucaadmin}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
  
                res.should.have.status(204);
                co(function*() {
                  var _questions = yield Question.find({ 'comments.author': _user });
                  var _articles = yield Article.find({ 'comments.author': _user });
                  _questions.should.have.length(0);
                  _articles.should.have.length(0);
  
                  done();
                });
              });
          }
          catch (e) {
            return done(e);
          }
        });
      });
    });
    it('followed user count must be decreased if one is cancelled', function (done) {
      let _user = new User({ email: 'user@email.com', password: 'pippo', province: 'Bologna', provider: 'local' });
      _user.save(function(err, user) {
        agent
          .put('/api/users/me/followed')
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .send({ id: user.id })
          .type('application/json')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
            agent
              .del(`/api/users/${user.id}`)
              .set('Authorization', `Bearer ${_token_lucaadmin}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
  
                res.should.have.status(204);
                agent
                  .get('/api/users/me')
                  .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
                  .query({ statistics: 'followed' })
                  .end(function (err, res) {
                    if (err) {
                      return done(err);
                    }
                    res.should.have.status(200);
                    res.body.statistics.followed.should.be.equal(2);
  
                    done();
                  });
              });
          });
      });
    });

  });

  describe('GET /api/users/all', function () {
    let _token_lucaadmin, _token_qualifiedclaudio;

    before(function (done) {
      co(function*() {
        try {
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
          // get valid token for user: lucaadmin@tsos.com
          _token_lucaadmin = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({ 'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin' })
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
        catch (e) {
          done(e);
        }
      });
    });
    it('should kick back without a valid token', function (done) {
      agent
        .get('/api/users/all')
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
        .get('/api/users/all')
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
        .get('/api/users/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(10);
          done();
        });
    });
    it('should not contains salt, password or hashed password', function (done) {
      agent
        .get('/api/users/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.should.not.have.properties(['password', 'salt', 'hashedPassword']);
          });

          done();
        });
    });
    it('should contains every users', function (done) {
      agent
        .get('/api/users/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.role.should.be.equalOneOf(config.userRoles);
          });

          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/users/all?per_page=3&page=0')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(3);

          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get('/api/users/all?f=firstname')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.body.users.should.matchEach(function (user) {
            Object.keys(user).should.have.length(2);
            user.should.have.property('firstname');
          });

          done();
        });
    });

  });

  describe('GET /api/users/requested', function () {

    it('should respond with JSON array', function (done) {
      agent
        .get('/api/users/requested')
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
    it('should not contains salt, password or hashed password', function (done) {
      agent
        .get('/api/users/requested')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.should.not.have.properties(['password', 'salt', 'hashedPassword']);
          });

          done();
        });
    });
    it('should contains only qualified users', function (done) {
      agent
        .get('/api/users/requested')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.role.should.be.equal("qualified");
          });

          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/users/requested?per_page=3&page=0')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(3);

          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get('/api/users/requested?f=firstname')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.matchEach(function (user) {
            Object.keys(user).should.have.length(2);
            user.should.have.property('firstname');
          });

          done();
        });
    });

  });

  describe('GET /api/users/followed', function () {

    it('should respond with JSON array', function (done) {
      agent
        .get('/api/users/followed')
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
    it('should not contains salt, password or hashed password', function (done) {
      agent
        .get('/api/users/followed')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.should.not.have.properties(['password', 'salt', 'hashedPassword']);
          });

          done();
        });
    });
    it('should contains only qualified users', function (done) {
      agent
        .get('/api/users/followed')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.role.should.be.equal("qualified");
          });

          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/users/followed?per_page=3&page=0')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(3);

          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get('/api/users/followed?f=firstname')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.matchEach(function (user) {
            Object.keys(user).should.have.length(2);
            user.should.have.property('firstname');
          });

          done();
        });
    });

  });

  describe('GET /api/users/resetPassword', function () {
    let _user = new User({ email: "becl75@gmail.com", password: "pippo", province: 'Bologna', firstname: 'newuser' }),
      _token;

    before(function (done) {
      co(function*() {
        try {
          _user = yield _user.save();
          _user.enablingToken = "";
          yield _user.save();
          // get valid token for user: editorfranco@tsos.com
          _token = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({ email: _user.email, password: 'pippo' })
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
        catch (e) {
          done(e);
        }
      });
    });
    after(function (done) {
      _user.remove(done);
    });

    it('should kick back without email parameter', function (done) {
      agent
        .get('/api/users/resetPassword')
        .query({ province: _user.province })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(400);
          res.text.should.be.equal("Missing email or province parameters in query string")

          done();
        });
    });
    it('should kick back without province parameter', function (done) {
      agent
        .get('/api/users/resetPassword')
        .query({ email: _user.email })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(400);
          res.text.should.be.equal("Missing email or province parameters in query string")

          done();
        });
    });
    it('should kick back for an invalid user', function (done) {
      agent
        .get('/api/users/resetPassword')
        .query({ email: _user.email, province: 'Milano' })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(404);
          res.body.message.should.be.equal("Utente non presente")

          done();
        });
    });
    it('should generate and reset a new password', function (done) {
      agent
        .get('/api/users/resetPassword')
        .query({ email: _user.email, province: _user.province })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(204);
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            user.hashedPassword.should.not.be.equal(_user.hashedPassword);

            done();
          });
        });
    });
  });

  describe('GET /api/users/me', function () {
    let _token_editorfranco;

    before(function (done) {
      co(function*() {
        try {
          // get valid token for user: editorfranco@tsos.com
          _token_editorfranco = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({ 'email': 'editorfranco@tsos.com', 'password': 'editorfranco' })
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
        catch (e) {
          done(e);
        }
      });
    });

    it('should kick back without a valid token', function (done) {
      agent
        .get('/api/users/me')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should respond with the correct user', function (done) {
      agent
        .get('/api/users/me')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.should.have.property('email', 'editorfranco@tsos.com');
          done();
        });
    });
    it('should not contains salt, password or hashed password', function (done) {
      agent
        .get('/api/users/me')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.not.have.properties(['password', 'salt', 'hashedPassword']);

          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get('/api/users/me?f=firstname')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property('firstname');

          done();
        });
    });

  });

  describe('PUT /api/users/me', function () {
    let _user = new User({
        firstname: "Nomeoriginale",
        email: "nomeoriginale@tos.com",
        password: "pippo",
        role: "unqualified"
      }),
      _token;

    before(function (done) {
      co(function*() {
        try {
          _user = yield _user.save();
          _user.enablingToken = "";
          yield _user.save();
          // get valid token for user: editorfranco@tsos.com
          _token = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({ 'email': 'nomeoriginale@tos.com', 'password': 'pippo' })
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
        catch (e) {
          done(e);
        }
      });
    });
    after(function (done) {
      _user.remove(done);
    });

    it('should kick back without a valid token', function (done) {
      agent
        .put('/api/users/me')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should modify my profile', function (done) {
      agent
        .put('/api/users/me')
        .send({ firstname: 'Hocambiatonome' })
        .set('Authorization', `Bearer ${_token}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(204);

          User.findById(_user.id, function (err, user) {
            user.toObject().should.not.have.properties(['password', 'salt', 'hashedPassword']);
            user.toObject().firstname.should.be.equal("Hocambiatonome");
            done();
          });
        });
    });
    it('should not modify any immutable fields', function (done) {
      agent
        .put('/api/users/me')
        .send({ role: 'admin', hashedPassword: 'pippo' })
        .set('Authorization', `Bearer ${_token}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(204);

          User.findById(_user.id, function (err, user) {
            user.toObject().should.not.have.properties(['password', 'salt', 'hashedPassword']);
            user.toObject().role.should.be.equal("unqualified");
            done();
          });
        });
    });
    it('should not add a secondary specialization for a user without profile-pro subscription', function(done) {
      agent
        .put('/api/users/me')
        .send({secondarySpecializations: ['specializzazione secondaria'], web: "http://miosito.com"})
        .set('Authorization', `Bearer ${_token}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(204);
  
          User.findById(_user.id, function(err, user) {
            user.should.have.property('secondarySpecializations', undefined);
            user.should.have.property('web', undefined);
            done();
          });
        });
    });
    it('should add a secondary specialization for a user with profile-pro subscription', function(done) {
      User.findById(_user.id, function(err, user) {
        user.subscriptions = [{ name: 'profile-pro', active: true }];
        user.secondarySpecializations = ["urologia"];
        user.markModified('secondarySpecializations');
        user.markModified('subscriptions');
        user.save(function(err) {
          agent
            .put('/api/users/me')
            .send({secondarySpecializations: ["specializzazione secondaria", "seconda specializzazione sec."], web: "http://miosito.com"})
            .set('Authorization', `Bearer ${_token}`)
            .type('application/json')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              
              co(function*() {
                let _userDoc, _resApi;
                try {
                  res.should.have.status(204);
                 
                  // check user db document
                  _userDoc = yield User.findById(_user._id);
                  _userDoc.should.have.property('web', "http://miosito.com");
                  _userDoc.secondarySpecializations.should.be.Array();
                  _userDoc.secondarySpecializations.should.have.length(2);
                  _userDoc.secondarySpecializations[0].should.be.equal('specializzazione secondaria');
                  _userDoc.secondarySpecializations[1].should.be.equal('seconda specializzazione sec.');
                  
                  // check user with GET API
                  _resApi = yield new Promise((resolve, reject) => {
                    agent
                      .get('/api/users/me')
                      .set('Authorization', `Bearer ${_token}`)
                      .end(function (err, res) {
                        if (err) {
                          return reject(err);
                        }
                        
                        resolve(res);
                      });
                  });
                  _resApi.body.should.have.property('secondarySpecializations');
                  _resApi.body.secondarySpecializations.should.be.Array();
                  _resApi.body.secondarySpecializations.should.have.length(2);
                  _resApi.body.secondarySpecializations[0].should.be.equal('specializzazione secondaria');
                  _resApi.body.secondarySpecializations[1].should.be.equal('seconda specializzazione sec.');
                  _resApi.body.should.have.property('web', "http://miosito.com");
                  
                  done();
                }
                catch(err) {
                  done(err);
                }
              });
            });
        });
      });
    });
  });

  describe('GET /api/users/me/followed', function () {
    let _token_editorfranco;

    before(function (done) {
      co(function*() {
        try {
          // get valid token for user: editorfranco@tsos.com
          _token_editorfranco = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({ 'email': 'editorfranco@tsos.com', 'password': 'editorfranco' })
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
        catch (e) {
          done(e);
        }
      });
    });
    it('should kick back without a valid token', function (done) {
      agent
        .put('/api/users/me/followed')
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
        .get('/api/users/me/followed')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
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
    it('should not contains salt, password or hashed password', function (done) {
      agent
        .get('/api/users/me/followed')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.should.not.have.properties(['password', 'salt', 'hashedPassword']);
          });

          done();
        });
    });
    it('should contains only qualified users', function (done) {
      agent
        .get('/api/users/me/followed')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.role.should.be.equal("qualified");
          });

          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/users/me/followed?per_page=1&page=0')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(1);

          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get('/api/users/me/followed?f=firstname')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.matchEach(function (user) {
            Object.keys(user).should.have.length(2);
            user.should.have.property('firstname');
          });

          done();
        });
    });

  });

  describe('GET /api/users/{userId}/followed', function () {
    let _editorfranco;

    before(function (done) {
      co(function*() {
        _editorfranco = yield User.findOne({ email: 'editorfranco@tsos.com' });
        done();
      });
    });

    it('should respond with JSON array', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}/followed`)
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
    it('should not contains salt, password or hashed password', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}/followed`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.should.not.have.properties(['password', 'salt', 'hashedPassword']);
          });

          done();
        });
    });
    it('should contains only qualified users', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}/followed`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.users.should.matchEach(function (user) {
            user.role.should.be.equal("qualified");
          });

          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}/followed`)
        .query({ per_page: 1, page: 0 })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.have.length(1);

          done();
        });
    });
    it('should respond with requested fields', function (done) {
      agent
        .get(`/api/users/${_editorfranco.id}/followed`)
        .query({ f: 'firstname' })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json();
          res.body.users.should.be.an.Array();
          res.body.users.should.matchEach(function (user) {
            Object.keys(user).should.have.length(2);
            user.should.have.property('firstname');
          });

          done();
        });
    });

  });

  describe('PUT /api/users/{userId}/validateRegistration', function () {
    let _newuser, _unqualifieduser, _token_lucaadmin, _token_qualifiedclaudio;

    before(function (done) {
      co(function*() {
        try {
          _newuser = yield User.create({ email: 'newuser@tsos.com', registrationPending: true, password: 'pippo' });
          _unqualifieduser = yield User.findOne({ email: 'unqualifiedmassimo@tsos.com' });
          // get valid token for user: lucaadmin@tsos.com
          _token_lucaadmin = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({ 'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin' })
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                resolve(res.body.token);
              });
          });
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
        }
        catch (e) {
          done(e);
        }
      });
    });
    after(function (done) {
      _newuser.remove(done);
    });

    it('should kick back without a valid token', function (done) {
      agent
        .put(`/api/users/${_newuser.id}/validateRegistration`)
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
        .put(`/api/users/${_newuser.id}/validateRegistration`)
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          done();
        });
    });
    it('should not validate an alredy registered user', function (done) {
      agent
        .put(`/api/users/${_unqualifieduser.id}/validateRegistration`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(404);
          res.body.message.should.eql("Utente già registrato");

          done();

        });
    });
    it('should validate the qualified user registration', function (done) {
      agent
        .put(`/api/users/${_newuser.id}/validateRegistration`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(204);

          User.findById(_newuser.id, function (err, user) {
            user.registrationPending.should.be.false();
            user.role.should.be.eql('qualified');

            done();
          });
        });
    });

  });

  describe('GET /api/users/{userId}/ban', function () {
    describe('UNQ/UQ users', function () {
      let _qualifiedclaudio, _qualifiedfides,
        _token_lucaadmin, _token_qualifiedclaudio, _token_qualifiedfides, _token_brunoeditor;

      before(function (done) {
        co(function*() {
          try {
            _qualifiedclaudio = yield User.findOne({ 'email': 'qualifiedclaudio@tsos.com' });
            _qualifiedfides = yield User.findOne({ 'email': 'qualifiedfides@tsos.com' });
            // get valid token for user: lucaadmin@tsos.com
            _token_lucaadmin = yield new Promise((resolve, reject) => {
              agent
                .post('/auth/local')
                .send({ 'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin' })
                .type('application/json')
                .end((err, res) => {
                  if (err) {
                    reject(err);
                  }
                  resolve(res.body.token);
                });
            });
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
            _token_qualifiedfides = yield new Promise((resolve, reject) => {
              agent
                .post('/auth/local')
                .send({ 'email': 'qualifiedfides@tsos.com', 'password': 'qualifiedfides' })
                .type('application/json')
                .end((err, res) => {
                  if (err) {
                    reject(err);
                  }
                  resolve(res.body.token);
                });
            });
            _token_brunoeditor = yield new Promise((resolve, reject) => {
              agent
                .post('/auth/local')
                .send({ 'email': 'brunoeditor@tsos.com', 'password': 'brunoeditor' })
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
          catch (e) {
            done(e);
          }
        });
      });
      afterEach(function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: false
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function () {
            agent
              .get(`/api/users/${_qualifiedfides.id}/ban`)
              .query({
                active: false
              })
              .set('Authorization', `Bearer ${_token_lucaadmin}`)
              .end(done);
          });
      });

      it('should kick back without a valid token', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
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
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(403);
            done();
          });
      });
      it('should kick back without active parameter', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(400);
            done();
          });
      });
      it('banned user is unable to login', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .post('/auth/local')
              .send({ email: 'qualifiedclaudio@tsos.com', password: 'qualifiedclaudio' })
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(401);

                done();
              });
          });
      });
      it('no one can be able to register with the same banned email', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .post('/api/users')
              .send({
                email: 'qualifiedclaudio@tsos.com',
                password: 'qualifiedclaudio',
                province: 'Bologna',
                provider: 'local'
              })
              .type('json')
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(422);

                done();
              });
          });
      });
      it('no articles from banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/articles')
              .query({
                q: `author:${_qualifiedclaudio.id}`
              })
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.articles.should.be.an.Array();
                res.body.articles.should.have.length(0);

                done();
              });
          });
      });
      it('no article detail from banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            Article.findOne({ author: _qualifiedclaudio.id }, { _id: true }, (err, article) => {
              agent
                .get(`/api/articles/${article.id}`)
                .end(function (err, res) {
                  if (err) {
                    return done(err);
                  }
                  res.should.have.status(403);

                  done();
                });
            });
          });
      });
      it('no question detail from banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            Question.findOne({ author: _qualifiedclaudio.id }, { _id: true }, (err, question) => {
              agent
                .get(`/api/questions/${question.id}`)
                .end(function (err, res) {
                  if (err) {
                    return done(err);
                  }
                  res.should.have.status(403);

                  done();
                });
            });
          });
      });
      it('no question detail made to a banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            Question.findOne({ target_user: _qualifiedclaudio.id }, { _id: true }, (err, question) => {
              agent
                .get(`/api/questions/${question.id}`)
                .end(function (err, res) {
                  if (err) {
                    return done(err);
                  }
                  res.should.have.status(403);

                  done();
                });
            });
          });
      });
      it('banned user article must disappear from most followed article list', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/articles/mostfollowed')
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.should.be.json();
                res.body.articles.should.be.an.Array();
                res.body.articles.should.have.length(4);
                res.body.articles.should.containDeepOrdered([
                  { title: 'Occhi stanchi, curarli col collirio' },
                  { title: 'Le nuove lenti progressive' },
                  { title: 'La musica per combattere il dolore cronico' },
                  { title: 'Raccolta fondi per la ricerca' }
                ]);

                done();
              });
          });
      });
      it('no question made to banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/questions')
              .query({
                q: `target_user:${_qualifiedclaudio.id}`
              })
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.questions.should.be.an.Array();
                res.body.questions.should.have.length(0);

                done();
              });
          });
      });
      it('no question made by a banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/questions')
              .query({
                q: `author:${_qualifiedclaudio.id}`
              })
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.questions.should.be.an.Array();
                res.body.questions.should.have.length(0);

                done();
              });
          });
      });
      it('no searched content produced by/targetted to a banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .post('/api/query/content')
              .send({ string: "soffro" })
              .type('json')
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }

                res.should.have.status(200);
                res.should.be.json();
                res.body.articles.should.be.an.Array();
                res.body.questions.should.be.an.Array();
                res.body.questions.should.matchEach(function (question) {
                  question.target_user.firstname.should.not.equal(_qualifiedclaudio.firstname);
                });
                done();
              });
          });
      });
      it('should prevent to make a question to a banned user', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .post('/api/questions')
              .send({ text: 'Domanda privata', target_user: _qualifiedclaudio.id })
              .type('application/json')
              .set('Authorization', `Bearer ${_token_qualifiedfides}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(400);

                done();
              });
          });
      });
      it('no comments made by banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/comments')
              .set('Authorization', `Bearer ${_token_qualifiedfides}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.should.matchEach(function (content) {
                  content.comments.should.matchEach(function (comment) {
                    comment.author._id.should.not.equal(_qualifiedclaudio.id);
                  });
                });

                done();
              });
          });

      });
      it('no articles commented by banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/comments/articles')
              .set('Authorization', `Bearer ${_token_qualifiedfides}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.articles.should.matchEach(function (content) {
                  content.comments.should.matchEach(function (comment) {
                    comment.author.should.not.equal(_qualifiedclaudio.id);
                  });
                });

                done();
              });
          });

      });
      it('no questions commented by banned user are visible', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/comments/questions')
              .set('Authorization', `Bearer ${_token_qualifiedfides}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.questions.should.matchEach(function (content) {
                  content.comments.should.matchEach(function (comment) {
                    comment.author.should.not.equal(_qualifiedclaudio.id);
                  });
                });

                done();
              });
          });

      });
      it('banned user must disappear from UQ list', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/users')
              .query({
                q: 'role:qualified'
              })
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.users.should.matchEach(function (item) {
                  item._id.should.not.be.equal(_qualifiedclaudio.id);
                });

                done();
              });
          });
      });
      it('banned user must disappear from most followed user list', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/users/followed')
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.users.should.matchEach(function (item) {
                  item._id.should.not.be.equal(_qualifiedclaudio.id);
                });

                done();
              });
          });
      });
      it('banned user must disappear from any user followed list', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/users/me/followed')
              .set('Authorization', `Bearer ${_token_brunoeditor}`)
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.users.should.matchEach(function (item) {
                  item._id.should.not.be.equal(_qualifiedclaudio.id);
                });

                done();
              });
          });
      });
      it('banned user must disappear from most requested user list', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/users/requested')
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.users.should.matchEach(function (item) {
                  item._id.should.not.be.equal(_qualifiedclaudio.id);
                });

                done();
              });
          });
      });
      it('banned user must disappear from any user seach', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .post('/api/query/users')
              .send({ string: "claudio" })
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
      });
      it('banned user profile should not been accessible to non-admin users', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get(`/api/users/${_qualifiedclaudio.id}`)
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(403);

                done();
              });
          });
      });
      it('banned user profile should be accessible to admin users', function (done) {
        agent
          .get(`/api/users/${_qualifiedclaudio.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get(`/api/users/${_qualifiedclaudio.id}`)
              .set('Authorization', `Bearer ${_token_lucaadmin}`)
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body._id.should.be.equal(_qualifiedclaudio.id);

                done();
              });
          });
      });

    });
    describe('Editor users', function () {
      let _brunoeditor,
        _token_lucaadmin, _token_brunoeditor, _token_qualifiedfides;

      before(function (done) {
        co(function*() {
          try {
            _brunoeditor = yield User.findOne({ 'email': 'brunoeditor@tsos.com' });
            // get valid token for user: lucaadmin@tsos.com
            _token_lucaadmin = yield new Promise((resolve, reject) => {
              agent
                .post('/auth/local')
                .send({ 'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin' })
                .type('application/json')
                .end((err, res) => {
                  if (err) {
                    reject(err);
                  }
                  resolve(res.body.token);
                });
            });
            // get valid token for user: qualifiedclaudio@tsos.com
            _token_brunoeditor = yield new Promise((resolve, reject) => {
              agent
                .post('/auth/local')
                .send({ 'email': 'brunoeditor@tsos.com', 'password': 'brunoeditor' })
                .type('application/json')
                .end((err, res) => {
                  if (err) {
                    reject(err);
                  }
                  resolve(res.body.token);
                });
            });
            _token_qualifiedfides = yield new Promise((resolve, reject) => {
              agent
                .post('/auth/local')
                .send({ 'email': 'qualifiedfides@tsos.com', 'password': 'qualifiedfides' })
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
          catch (e) {
            done(e);
          }
        });
      });
      afterEach(function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: false
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(done);
      });

      it('should kick back without a valid token', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
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
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_brunoeditor}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(403);
            done();
          });
      });
      it('banned user is unable to login', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .post('/auth/local')
              .send({ email: 'brunoeditor@tsos.com', password: 'brunoeditor' })
              .type('application/json')
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(401);

                done();
              });
          });
      });
      it('no one can be able to register with the same banned email', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .post('/api/users')
              .send({
                email: 'brunoeditor@tsos.com',
                password: 'brunoeditor',
                province: 'Bologna',
                provider: 'local',
                role: 'editor'
              })
              .set('Authorization', `Bearer ${_token_lucaadmin}`)
              .type('json')
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(422);

                done();
              });
          });
      });
      it('banned user articles must be present in article list', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/articles')
              .query({
                q: `author:${_brunoeditor.id}`,
                s: 'pub_date|DESC'
              })
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.should.be.json();
                res.body.articles.should.be.an.Array();
                res.body.articles.should.have.length(2);
                res.body.articles.should.containDeepOrdered([
                  { title: 'Non solo curara con le erbe' },
                  { title: 'Piede e diabete: come prevenire i disturbi più frequenti' }
                ]);

                done();
              });
          });
      });
      it('question made by banned user must be present in question list', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/questions')
              .query({
                q: `author:${_brunoeditor.id}`,
                s: 'pub_date|DESC'
              })
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.should.be.json();
                res.body.questions.should.be.an.Array();
                res.body.questions.should.have.length(1);
                res.body.questions[0].text.should.be.equal('Soffro di labbro leporino sapere cosa posso fare per risolvere questo problema, se si può curare oppure no.');

                done();
              });
          });
      });
      it('banned user profile should be accessible', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get(`/api/users/${_brunoeditor.id}`)
              .end((err, res) => {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body._id.should.be.equal(_brunoeditor.id);

                done();
              });
          });
      });
      it('all comments made by banned user still be visible', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/comments')
              .set('Authorization', `Bearer ${_token_qualifiedfides}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.should.matchAny(function (content) {
                  content.comments.should.matchAny(function (comment) {
                    comment.author._id.should.be.equal(_brunoeditor.id);
                  });
                });

                done();
              });
          });

      });
      it('articles commented by banned user still be visible', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/comments/articles')
              .query({ f: 'comments' })
              .set('Authorization', `Bearer ${_token_qualifiedfides}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.articles.should.matchAny(function (content) {
                  content.comments.should.matchAny(function (comment) {
                    comment.author._id.should.be.equal(_brunoeditor.id);
                  });
                });

                done();
              });
          });

      });
      it('questions commented by banned user still be visible', function (done) {
        agent
          .get(`/api/users/${_brunoeditor.id}/ban`)
          .query({
            active: true
          })
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.should.have.status(200);
            agent
              .get('/api/comments/questions')
              .query({ f: 'comments' })
              .set('Authorization', `Bearer ${_token_qualifiedfides}`)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                res.should.have.status(200);
                res.body.questions.should.matchAny(function (content) {
                  content.comments.should.matchAny(function (comment) {
                    comment.author._id.should.be.equal(_brunoeditor.id);
                  });
                });

                done();
              });
          });

      });
    });
  });

  describe('POST /api/users', function () {
    let _user = { email: 'tisostengo@mailinator.com', password: 'pippo', province: 'Bologna' },
      _token_lucaadmin;

    before(function (done) {
      co(function*() {
        try {
          // get valid token for user: lucaadmin@tsos.com
          _token_lucaadmin = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({ 'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin' })
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
        catch (e) {
          done(e);
        }
      });
    });
    afterEach(function (done) {
      User.remove({ email: _user.email }, done);
    });

    it('should fail without user email', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, { email: '' }))
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(422);
          User.findOne({ email: _user.email }, (err, user) => {
            should.not.exist(user);
          });

          done();
        });
    });
    it('should fail without user password', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, { email: '' }))
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(422);
          User.findOne({ email: _user.email }, (err, user) => {
            should.not.exist(user);
          });

          done();
        });
    });
    it('should fail with an already registered email', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, { email: 'lucaadmin@tsos.com' }))
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(422);

          done();
        });
    });
    it('should update data and resend confirmation email if attempt to register with an email in pending state', function (done) {
      agent
        .post('/api/users')
        .send(_user)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          agent
            .post('/api/users')
            .send(_.merge({}, _user, { province: 'Bolzano' }))
            .type('json')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              res.should.have.status(201);
              User.findOne({ email: _user.email }, function (err, user) {
                if (err) {
                  return done(err);
                }

                user.should.have.property('email', _user.email);
                user.should.have.property('province', 'Bolzano');
                user.role.should.be.equal("unqualified");
                user.provider.should.be.equal("local");
                user.registrationPending.should.be.false();
                user.enablingToken.should.not.be.empty();

                done();
              });
            });
        });
    });
    it('should create an unqualified valid user', function (done) {
      agent
        .post('/api/users')
        .send(_user)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            user.toObject().should.have.property('email', _user.email);
            user.toObject().should.have.property('province', _user.province);
            user.toObject().should.have.property('reg_date');
            user.toObject().should.not.have.property('val_date');
            user.role.should.be.equal("unqualified");
            user.provider.should.be.equal("local");
            user.registrationPending.should.be.false();
            user.enablingToken.should.not.be.empty();

            done();
          });
        });
    });
    it('response should contain a valid login token', function (done) {
      agent
        .post('/api/users')
        .send(_user)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          res.should.be.json();
          res.body.should.have.property('token');
          res.body.token.should.be.a.String();

          agent
            .get("/api/users/me")
            .set('Authorization', `Bearer ${res.body.token}`)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              res.should.have.status(200);
              res.should.be.json();

              done();
            });
        });
    });
    it('unqualified user should have firstname field equal to email username', function (done) {
      agent
        .post('/api/users')
        .send(_user)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            user.should.have.property('email', _user.email);
            user.should.have.property('firstname', _user.email.substring(0, _user.email.indexOf('@')));
            user.role.should.be.equal("unqualified");
            user.provider.should.be.equal("local");
            user.registrationPending.should.be.false();
            user.enablingToken.should.not.be.empty();

            done();
          })
        });
    });
    it('should create a pendinq qualified user', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, {
          registrationPending: true,
          specialization: 'Dermatologia',
          firstname: 'New',
          lastname: 'User',
          gender: 'M'
        }))
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            user.toObject().should.have.property('reg_date');
            user.toObject().should.have.property('email', _user.email);
            user.toObject().should.have.property('firstname', 'New');
            user.toObject().should.have.property('lastname', 'User');
            user.toObject().should.have.property('gender', 'M');
            user.toObject().should.have.property('specialization', 'Dermatologia');
            user.role.should.be.equal("unqualified");
            user.registrationPending.should.be.true();
            user.enablingToken.should.not.be.empty();
            user.provider.should.be.equal("local");

            done();
          })
        });
    });
    it('pending user should not be able to login', function (done) {
      agent
        .post('/api/users')
        .send(_user)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          agent
            .post("/auth/local")
            .send({ email: _user.email, password: _user.password })
            .type('json')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              res.should.have.status(401);

              done();
            });
        });
    });
    it('normal user should not be able to create an admin user', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, { role: 'admin', firstname: 'Admin', lastname: 'User', gender: 'M' }))
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          res.text.should.be.equal("Don't have enough privileges to create this type of user");
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            should.not.exist(user);

            done();
          });
        });
    });
    it('normal user should not be able to create an editor user', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, { role: 'editor', firstname: 'Editor', lastname: 'User', gender: 'M' }))
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(403);
          res.text.should.be.equal("Don't have enough privileges to create this type of user");
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            should.not.exist(user);

            done();
          });
        });
    });
    it('admin logged user should be able to create an editor user', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, { role: 'editor', firstname: 'Editor', lastname: 'User', gender: 'M' }))
        .type('json')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            user.toObject().should.have.property('reg_date', null);
            user.toObject().should.have.property('email', _user.email);
            user.toObject().should.have.property('firstname', 'Editor');
            user.toObject().should.have.property('lastname', 'User');
            user.toObject().should.have.property('gender', 'M');
            user.role.should.be.equal("editor");
            user.registrationPending.should.be.false();
            user.enablingToken.should.be.empty();
            user.provider.should.be.equal("local");

            done();
          });
        });
    });
    it('admin logged user should be able to create an admin user', function (done) {
      agent
        .post('/api/users')
        .send(_.merge({}, _user, { role: 'admin', firstname: 'Admin', lastname: 'User', gender: 'M' }))
        .type('json')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(201);
          User.findOne({ email: _user.email }, function (err, user) {
            if (err) {
              return done(err);
            }

            user.toObject().should.have.property('reg_date', null);
            user.toObject().should.have.property('email', _user.email);
            user.toObject().should.have.property('firstname', 'Admin');
            user.toObject().should.have.property('lastname', 'User');
            user.toObject().should.have.property('gender', 'M');
            user.role.should.be.equal("admin");
            user.registrationPending.should.be.false();
            user.enablingToken.should.be.empty();
            user.provider.should.be.equal("local");

            done();
          });
        });
    });
  });

  describe('GET /api/users/validate/{validationToken}', function () {
    let _user = new User({
      firstname: "New",
      email: "newuser@tos.com",
      password: "pippo",
      role: "unqualified",
      provider: 'local'
    });

    before(function (done) {
      _user.save(function (err, user) {
        _user = user;
        done();
      });
    });
    after(function (done) {
      _user.remove(done);
    });
    it('should fail if user is already registered and confirmed', function (done) {
      agent
        .get(`/api/users/validate/nomorevalidvalidationtoken`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.should.have.status(302);

          done();
        });
    });
    it('should enable an user registration from its confirmation token', function (done) {
      agent
        .get(`/api/users/validate/${_user.enablingToken}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          res.statusCode.should.be.equalOneOf(200, 302);
          res.should.have.header('set-cookie');

          User.findById(_user.id, (err, user) => {
            if (err) {
              return done(err);
            }
            user.toObject().should.have.property('reg_date', null);
            user.toObject().should.have.property('val_date');

            done();
          });
        });

    });
  });
});

describe('user model', function () {

  it('should not have any active subscriptions', function (done) {
    co(function*() {
      try {
        let _user = yield User.findOne();

        should(_user.checkSubscriptionsState('raking')).not.be.true();
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should report subscription as active when user has one', function(done) {
    co(function*() {
      try {
        let _user = yield User.findOne();
        _user.subscriptions.push({ name: 'ranking', active: true });
        yield _user.save();

        should(_user.checkSubscriptionsState('ranking')).be.true();
        done();
      } catch (e) {
        done(e);
      }
    });
  });

});
