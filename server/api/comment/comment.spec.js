'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest'),
      co = require('co'),
      agent = request(app),
      config = require('../../config/environment'),
      Article = require('../article/article.model'),
      Question = require('../question/question.model'),
      User = require('../user/user.model');

describe('comments API', function() {
  describe('GET /api/comments', function () {
    
    let _token_qualifiedfides;
    
    before(function(done) {    
      co(function*() {
        try {
          // get valid token for user: lucaadmin@tsos.com
          _token_qualifiedfides = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'qualifiedfides@tsos.com', 'password': 'qualifiedfides'})
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
        .get('/api/comments')
        .expect(403)
        .end(done);
    });
    
    it('should respond with JSON array', function (done) {
      agent
        .get(`/api/comments`)
        .set('Authorization', `Bearer ${_token_qualifiedfides}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.should.be.an.Array();
          res.body.should.matchEach(function(item) {
            item.should.have.property('elType');
            item.elType.should.be.equalOneOf('article','question');
          });
          
          done();
        });
    });
  
  });
  
  describe('GET /api/comments/articles', function () {
    
    let _brunoeditor, _qualifiedfides, _token_brunoeditor, _token_qualifiedfides;
    
    before(function(done) {    
      co(function*() {
        try {
          _brunoeditor = yield User.findOne({'email': 'brunoeditor@tsos.com'}, {_id: true});
          _qualifiedfides = yield User.findOne({'email': 'qualifiedfides@tsos.com'});
          // get valid token for user: lucaadmin@tsos.com
          _token_brunoeditor = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'brunoeditor@tsos.com', 'password': 'brunoeditor'})
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
              .send({'email': 'qualifiedfides@tsos.com', 'password': 'qualifiedfides'})
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
        .get('/api/comments/articles')
        .expect(403)
        .end(done);
    });
    it('should respond with JSON array', function (done) {
      agent
        .get(`/api/comments/articles`)
        .set('Authorization', `Bearer ${_token_qualifiedfides}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.matchEach(function(article) {
            article.should.not.have.property('thumbnail');
            article.should.have.property('title');
            article.should.have.property('text');
            article.should.have.property('comments');
            article.author.should.have.property('title');
            article.author.should.have.property('firstname');
            article.author.should.have.property('lastname');
            article.comments.should.matchAny(function(comment) {
              comment.author._id.should.be.equal(_qualifiedfides.id);
            });
          });
          
          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/comments/articles?per_page=10&page=0')
        .set('Authorization', `Bearer ${_token_brunoeditor}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
    
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.have.length(10);
          
          done();
        });
    });
  
  });
  
  describe('GET /api/comments/questions', function () {
    
    let _lucaadmin, _token_lucaadmin;
    
    before(function(done) {    
      co(function*() {
        try {
          _lucaadmin = yield User.findOne({'email': 'lucaadmin@tsos.com'}, {_id: true});
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
        .get('/api/comments/questions')
        .expect(403)
        .end(done);
    });
    
    it('should respond with JSON array', function (done) {
      agent
        .get(`/api/comments/questions`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.questions.should.be.an.Array();
          res.body.questions.should.have.length(7);
          res.body.questions.should.matchEach(function(question) {
            question.should.have.property('text');
            question.should.have.property('comments');
            question.target_user.should.have.property('title');
            question.target_user.should.have.property('firstname');
            question.target_user.should.have.property('lastname');
            question.comments.should.matchAny(function(comment) {
              comment.author._id.should.be.equal(_lucaadmin.id);
            });
          });
          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/comments/questions?per_page=2&page=0')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
    
          res.should.have.status(200);
          res.should.be.json();
          res.body.questions.should.be.an.Array();
          res.body.questions.should.have.length(2);
          
          done();
        });
    });
  });
  
  describe('POST /api/comments/articles/{articleId}', function () {
    let _token_qualifiedclaudio;
    
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
          
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    it('should kick back without a valid token', function (done) {
      Article.create({}, function (err, article) {
        if (err) {
          return done(err);
        }
  
        agent
          .post(`/api/comments/articles/${article.id}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(403);
            
            article.remove(done);
          });
      });
    });
    it('should add comment to article', function (done) {
      Article.create({}, function (err, article) {
        if (err) {
          return done(err);
        }
  
        agent
          .post(`/api/comments/articles/${article.id}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .send({text: "Commento"})
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
           res.should.have.status(201);
           Article.findById(article.id, function (err, article) {
              if (err) {
                return done(err);
              }
  
              article.comments.should.have.length(1);
              article.comments[0].should.have.property('text', "Commento");
              article.remove(done);
            });
          })
      });
    });
    it('should return added commment', function (done) {
      Article.create({}, function (err, article) {
        if (err) {
          return done(err);
        }
  
        agent
          .post(`/api/comments/articles/${article.id}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .send({text: "Commento"})
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
            res.should.have.status(201);
            res.should.be.json();
            res.body.should.have.property('_id');
            res.body.should.have.property('date');
            res.body.should.have.property('text', "Commento");
            res.body.should.have.property('author');
            res.body.author.should.have.properties(['title', 'firstname', 'lastname']);
            article.remove(done);
          });
      });
    });
  });
  
  describe('POST /api/comments/questions/{questionId}', function () {
    let _token_qualifiedclaudio;
    
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
          
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    it('should kick back without a valid token', function (done) {
      Question.create({}, function (err, question) {
        if (err) {
          return done(err);
        }
  
        agent
          .post(`/api/comments/questions/${question.id}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(403);
            
            question.remove(done);
          });
      });
    });
    it('should add comment to question', function (done) {
      Question.create({}, function (err, question) {
        if (err) {
          return done(err);
        }
  
        agent
          .post(`/api/comments/questions/${question.id}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .send({text: "Commento"})
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
           res.should.have.status(201);
           Question.findById(question.id, function (err, question) {
              if (err) {
                return done(err);
              }
  
              question.comments.should.have.length(1);
              question.comments[0].should.have.property('text', "Commento");
              question.remove(done);
            });
          })
      });
    });
  });

  describe('DELETE /api/comments/{commentId}', function () {
    let _token_qualifiedclaudio, _token_unqualifiedcarla, _token_editorluca,
        _qualifiedclaudio, _editorluca, _unqualifiedcarla;
    
    before(function(done) {
      co(function*() {
        try {
          _qualifiedclaudio = yield User.findOne({email: 'qualifiedclaudio@tsos.com'});
          _unqualifiedcarla = yield User.findOne({email: 'unqualifiedcarla@tsos.com'});
          _editorluca = yield User.findOne({email: 'lucaadmin@tsos.com'});
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
          _token_editorluca = yield new Promise((resolve, reject) => {
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
      Article.create({author: _qualifiedclaudio.id, comments:[{author:_unqualifiedcarla.id, text: "Commento"}]}, function (err, article) {
        if (err) {
          return done(err);
        }
  
        agent
          .del(`/api/comments/${article.comments[0].id}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(403);
            
            article.remove(done);
          });
      });
    });
    it('admin should remove comment to article', function (done) {
      Article.create({author: _qualifiedclaudio.id, comments:[{author:_unqualifiedcarla.id, text: "Commento"}]}, function (err, article) {
        if (err) {
          return done(err);
        }
  
        agent
          .del(`/api/comments/${article.comments[0].id}`)
          .set('Authorization', `Bearer ${_token_editorluca}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
           res.should.have.status(204);
           Article.findById(article.id, {comments: true}, function (err, article) {
              if (err) {
                return done(err);
              }
              article.comments.should.have.length(0);
              
              article.remove(done);
            });
          })
      });
    });
    it('non author should not remove comment to article', function (done) {
      Article.create({author: _qualifiedclaudio.id, comments:[{author:_unqualifiedcarla.id, text: "Commento"}]}, function (err, article) {
        if (err) {
          return done(err);
        }
  
        agent
          .del(`/api/comments/${article.comments[0].id}`)
          .set('Authorization', `Bearer ${_token_unqualifiedcarla}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(403);
            
            article.remove(done);
          });
      });
    });
    it('article author should remove comment to article', function (done) {
      Article.create({author: _qualifiedclaudio.id, comments:[{author:_unqualifiedcarla.id, text: "Commento"}]}, function (err, article) {
        if (err) {
          return done(err);
        }
  
        agent
          .del(`/api/comments/${article.comments[0].id}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
           res.should.have.status(204);
           Article.findById(article.id, function (err, article) {
              if (err) {
                return done(err);
              }
  
              article.comments.should.have.length(0);
              article.remove(done);
            });
          })
      });
    });
    it('non target user should not remove comment to question', function (done) {
      Question.create({target_user: _qualifiedclaudio.id, comments:[{author:_unqualifiedcarla.id, text: "Commento"}]}, function (err, question) {
        if (err) {
          return done(err);
        }
  
        agent
          .del(`/api/comments/${question.comments[0].id}`)
          .set('Authorization', `Bearer ${_token_unqualifiedcarla}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(403);
            
            question.remove(done);
          });
      });
    });
    it('question target user should remove comment', function (done) {
      Question.create({target_user: _qualifiedclaudio.id, comments:[{author:_unqualifiedcarla.id, text: "Commento"}]}, function (err, question) {
        if (err) {
          return done(err);
        }
  
        agent
          .del(`/api/comments/${question.comments[0].id}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
  
           res.should.have.status(204);
           Question.findById(question.id, function (err, question) {
              if (err) {
                return done(err);
              }
  
              question.comments.should.have.length(0);
              question.remove(done);
            });
          })
      });
    });
  });
});