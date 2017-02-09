'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest'),
      co = require('co'),
      cheerio = require('cheerio'),
      Article = require('./article.model'),
      User = require('../user/user.model'),
      agent = request(app),
      config = require('../../config/environment');

require('should-http');

describe('articles API', function() {
  describe('GET /api/articles', function () {
    
    it('should respond with JSON array', function (done) {
      agent
        .get('/api/articles')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          
          done();
        });
    });
    it('should respond only with pubblicated articles', function (done) {
      let notPubArticle = new Article({title: "Unpub article"});
      notPubArticle.save((err, article) => {
        agent
          .get('/api/articles')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(200);
            res.body.articles.should.matchEach(function(article) {
              article.should.not.have.property('pub_date', null);
            });
            article.remove(done);
          });
      });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/articles')
        .query({
          per_page: 10,
          page: 0
        })
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
    it('should respond with all articles written by given users', function (done) {
      User.findOne({email: 'lucaadmin@tsos.com'}, function(err, user) {
        if (err) {
          return done(err);
        }
  
        agent
          .get('/api/articles')
          .query({q: `author:${user.followed.join('|')}`})
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
              
            res.should.have.status(200);
            res.should.be.json();
            res.body.articles.should.be.an.Array();
            res.body.articles.should.have.length(12);
            
            done();
          });
      });
    });
  
  });

  describe('GET /api/articles/me', function () {
    let _token_qualifiedclaudio, _qualifiedclaudio;
    
    before(function(done) {    
      co(function*() {
        try {
          _qualifiedclaudio = yield User.findOne({'email': 'qualifiedclaudio@tsos.com'});
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
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    
    it('should kick back without a valid token', function (done) {
      agent
        .get('/api/articles/me')
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
        .get('/api/articles/me')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          
          done();
        });
    });
    it('should respond only with user articles', function (done) {
      agent
        .get('/api/articles/me')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.body.articles.should.matchEach(function(article) {
            article.author.should.have.property('_id', _qualifiedclaudio.id);
          });
          done();
      });
    });
    it('should respond with pubblicated and non-pubblicated articles', function (done) {
      let notPubArticle = new Article({author: _qualifiedclaudio.id, title: "Unpub article"});
      notPubArticle.save((err, article) => {
        agent
          .get('/api/articles/me')
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(200);
            res.body.articles.should.matchAny(function(article) {
              article.should.not.have.property('pub_date');
            });
            res.body.articles.should.matchAny(function(article) {
              article.should.have.property('pub_date');
            });
            article.remove(done);
          });
      });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/articles/me')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .query({
          per_page: 2,
          page: 0
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
    
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array().and.have.length(2);
          
          done();
        });
    });
  
  });
  
  describe('GET /api/articles/all', function () {
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
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    it('should kick back without a valid token', function (done) {
      agent
        .get('/api/articles/all')
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
        .get('/api/articles/all')
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
        .get('/api/articles/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          
          done();
        });
    });
    it('should respond only with all articles', function (done) {
      let notPubArticle = new Article({title: "Unpub article"});
      notPubArticle.save((err, article) => {
        agent
        .get('/api/articles/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(200);
            res.body.articles.should.have.length(17);
            article.remove(done);
          });
      });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/articles/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .query({
          per_page: 10,
          page: 0
        })
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
    it('should respond with all articles written by given users', function (done) {
      User.findOne({email: 'lucaadmin@tsos.com'}, function(err, user) {
        if (err) {
          return done(err);
        }
  
        agent
        .get('/api/articles/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .query({q: `author:${user.followed.join('|')}`})
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
              
            res.should.have.status(200);
            res.should.be.json();
            res.body.articles.should.be.an.Array();
            res.body.articles.should.have.length(12);
            
            done();
          });
      });
    });
  
  });
  
  describe('GET /api/articles/followed', function () {
    let _token_lucaadmin;
    
    before(function(done) {    
      co(function*() {
        try {
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
        .get('/api/articles/followed')
        .expect(403)
        .end(done);
    });
  
    it('should respond with first articles written by the your followed users', function (done) {
      agent
        .get('/api/articles/followed')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
            
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.have.length(5);
          res.body.articles.should.containDeepOrdered([
            {title: 'La musica per combattere il dolore cronico'},
            {title: 'Occhi stanchi, curarli col collirio'},
            {title: 'Le nuove lenti progressive'},
            {title: 'Chirurgia estetica, intervento al seno'},
            {title: 'Raccolta fondi per la ricerca'}
          ]);
          
          done();
        });
    });
    
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/articles/followed?per_page=1&page=3')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
    
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.have.length(1);
          res.body.articles.should.containDeepOrdered([
            {title: 'Chirurgia estetica, intervento al seno'}
          ]);
          
          done();
        });
    });
  });
  
  describe('GET /api/articles/followed/all', function () {
    let _token_lucaadmin;
    
    before(function(done) {    
      co(function*() {
        try {
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
        .get('/api/articles/followed/all')
        .expect(403)
        .end(done);
    });
  
    it('should respond with all articles written by the your followed users', function (done) {
      agent
        .get('/api/articles/followed/all')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
            
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.have.length(12);
          
          done();
        });
    });
    
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/articles/followed/all?per_page=7&page=0')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
    
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.have.length(7);
          
          done();
        });
    });
  });
  
  describe('GET /api/articles/mostfollowed', function () {
    let _token_editorfranco;
    
    before(function(done) {    
      co(function*() {
        try {
          // get valid token for user: editorfranco@tsos.com
          _token_editorfranco = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'editorfranco@tsos.com', 'password': 'editorfranco'})
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
  
    it('should respond with first articles written by the most followed users', function (done) {
      agent
        .get('/api/articles/mostfollowed')
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
            
          res.should.have.status(200);
          res.should.be.json();
          res.body.articles.should.be.an.Array();
          res.body.articles.should.have.length(5);
          res.body.articles.should.containDeepOrdered([
            {title: 'Occhi stanchi, curarli col collirio'},
            {title: 'La musica per combattere il dolore cronico'},
            {title: 'Le nuove lenti progressive'},
            {title: 'Chirurgia estetica, intervento al seno'},
            {title: 'Raccolta fondi per la ricerca'}
          ]);
          
          done();
        });
    });
  });
  
  describe('POST /api/articles', function () {
    let _token_editorfranco, _token_qualifiedclaudio, _token_unqualifiedcarla;
    
    before(function(done) {    
      co(function*() {
        try {
          // get valid token for user: lucaadmin@tsos.com
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
          // get valid token for user: editorfranco@tsos.com
          _token_editorfranco = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'editorfranco@tsos.com', 'password': 'editorfranco'})
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
      agent
        .post('/api/articles')
        .send({'title': 'Titolo Test'})
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    
    it('should kick back for an unqualified user', function (done) {
      agent
        .post('/api/articles')
        .send({title: 'Titolo Test'})
        .set('Authorization', `Bearer ${_token_unqualifiedcarla}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    
    it('should create a new article if \'m an editor user', function (done) {
      User.findOne({'email': 'editorfranco@tsos.com'}, function(err, author) {
        if (err) {
          return done(err);
        }
        
        agent
          .post('/api/articles')
          .send({title: 'Titolo Test'})
          .set('Authorization', `Bearer ${_token_editorfranco}`)
          .type('application/json')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(201);
            res.should.be.json();
            res.body.editorial.should.be.true();
            res.body.title.should.be.equal("Titolo Test");
            res.body.author.should.be.equal(author.id);
            
            Article.remove({_id: res.body._id}, done);
          });
      });
    });
  
    it('should create a new article if \'m a qualified user', function (done) {
      User.findOne({'email': 'qualifiedclaudio@tsos.com'}, function(err, author) {
        if (err) {
          return done(err);
        }
        
        agent
          .post('/api/articles')
          .send({title: 'Titolo Test'})
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .type('application/json')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(201);
            res.should.be.json();
            res.body.editorial.should.be.false();
            res.body.title.should.be.equal("Titolo Test");
            res.body.author.should.be.equal(author.id);
            
            Article.remove({_id: res.body._id}, done);
          });
      });
    });
  
  });
  
  describe('GET /api/articles/{articleId}', function () {
    let _token_lucaadmin, _token_editorfranco;
    
    before(function(done) {    
      co(function*() {
        try {
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
          // get valid token for user: editorfranco@tsos.com
          _token_editorfranco = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'editorfranco@tsos.com', 'password': 'editorfranco'})
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
    
    it('should respond with a brief of a non-editorial article if not logged', function (done) {
      Article.find({'editorial': false, 'category': 'Medicina'}, function(err, articles) {
        if (err) {
          return done(err);
        }
        
        agent
          .get(`/api/articles/${articles[0].id}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(200);
            res.should.be.json();
            res.body._id.should.be.equal(articles[0].id);
            res.body.text.should.have.length(300);
            done();
          });
      });
    });
    it('should respond with a full article if logged', function (done) {
      Article.find({'editorial': false, 'category': 'Medicina'}, function(err, articles) {
        if (err) {
          return done(err);
        }
        
        agent
          .get(`/api/articles/${articles[0].id}`)
          .set('Authorization', `Bearer ${_token_editorfranco}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(200);
            res.should.be.json();
            res.body._id.should.be.equal(articles[0].id);
            res.body.text.length.should.be.above(300);
            done();
          });
      });
    });
  });
    
  describe('PUT /api/articles/{articleId}', function () {
    let _token_lucaadmin, _token_editorfranco, _token_qualifiedclaudio, _author, _article;
    
    before(function(done) {
      co(function*() {
        try {
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
          // get valid token for user: editorfranco@tsos.com
          _token_editorfranco = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'editorfranco@tsos.com', 'password': 'editorfranco'})
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
    beforeEach(function(done) {
      co(function*() {
        try {        
          // create a fake article
          _author = yield User.findOne({'email': 'qualifiedclaudio@tsos.com'});
          _article = yield Article.create({author: _author, title: 'Fake article', thumbnail: 'https://tisostengo-dev.s3.amazonaws.com/articles/1451759249653_La_musica_per_combattere_il_dolore_cronico.jpg'});
          
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    afterEach(function(done) {
      _article.remove(done);
    });
    
    it('should kick back without a valid token', function (done) {
      agent
        .put(`/api/articles/${_article.id}`)
        .send({text: 'Testo fake'})
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    }); 
    it('should kick back for not enabled user', function (done) {
      agent
        .put(`/api/articles/${_article.id}`)
        .send({text: 'Testo fake'})
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(401);
          done();
        });
    });
    it('should kick back for a non existent article', function (done) {
      agent
        .put(`/api/articles/5679916e0b1c1a85621f0bfc`)
        .send({text: 'Testo fake'})
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(404);
          done();
        });
    });
    it('should modify an existent article if i\'m the author', function (done) {
      agent
        .put(`/api/articles/${_article.id}`)
        .send({text: 'Testo fake', thumbnail: 'https://tisostengo-dev.s3.amazonaws.com/articles/1451759249653_La_musica_per_combattere_il_dolore_cronico.jpg'})
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.title.should.be.equal(_article.title);
          res.body.text.should.be.equal("Testo fake");
          res.body.thumbnail.should.be.equal(_article.thumbnail);
          res.body.author.should.be.equal(_author.id);
          
          done();
        });
    });
    it('should modify an existent article if i\'m an administrator', function (done) {
      agent
        .put(`/api/articles/${_article.id}`)
        .send({text: 'Testo fake'})
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.title.should.be.equal(_article.title);
          res.body.text.should.be.equal("Testo fake");
          res.body.thumbnail.should.be.equal(_article.thumbnail);
          res.body.author.should.be.equal(_author.id);
          
          done();
        });
    });
    it('should not publish article if not already published', function (done) {
      agent
        .put(`/api/articles/${_article.id}`)
        .send({text: 'Testo fake'})
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.body.should.not.have.property('pub_date');
          
          done();
        });
    });
    it('should not change publication date only when we change title or text', function (done) {
      let _now = "2016-01-01T00:00:00.000Z";
      
      _article.pub_date = new Date(_now);
      _article.save(function(err, article) {
        agent
          .put(`/api/articles/${article.id}`)
          .send({priority: true})
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .type('application/json')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(200);
            Article.findById(article.id, function(err, article) {
              article.pub_date.toISOString().should.be.equal(_now);
              article.priority.should.be.true();
              
              done();
            });
          });
      });
    });
  });
  
  describe('DELETE /api/articles/{articleId}', function () {
    let _token_lucaadmin, _token_editorfranco, _token_qualifiedclaudio, _author, _article;
    
    before(function(done) {    
      co(function*() {
        try {
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
          // get valid token for user: editorfranco@tsos.com
          _token_editorfranco = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'editorfranco@tsos.com', 'password': 'editorfranco'})
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
    beforeEach(function(done) {
      co(function*() {
        try {        
          // create a fake article
          _author = yield User.findOne({'email': 'qualifiedclaudio@tsos.com'});
          _article = yield Article.create({'author': _author, 'title': 'Fake article'});
          
          done();
        }
        catch(e) {
          done(e);
        }
      });
    });
    afterEach(function(done) {
      _article.remove(done);
    });
   
    it('should kick back without a valid token', function (done) {
      agent
        .del(`/api/articles/${_article.id}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    
    it('should kick back for not enabled user', function (done) {
      agent
        .del(`/api/articles/${_article.id}`)
        .set('Authorization', `Bearer ${_token_editorfranco}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(401);
          done();
        });
    });
  
    it('should kick back for a non existent article', function (done) {
      agent
        .del(`/api/articles/5679916e0b1c1a85621f0bfc`)
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(404);
          done();
        });
    });
  
    it('should remove an existent article if i\'m the author', function (done) {
      agent
        .del(`/api/articles/${_article.id}`)
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(204);
          Article.findById(_article.id, function(err, res) {
            should.not.exist(res);
            done();
          });
        });
    });
  
    it('should remove an existent article if i\'m an administrator', function (done) {
      agent
        .del(`/api/articles/${_article.id}`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(204);
          Article.findById(_article.id, function(err, res) {
            should.not.exist(res);
            done();
          });
        });
    });
  
  });
  
  describe('GET /articolo/{articleId} on Facebook sharing request', function () {
    let _article;
    
    before(function(done) {
      Article.findOne({'title': "Spremitura a freddo: tra moda e dubbi scientifici" }, (err, article) => {_article = article; done();});
    });
    
    it('should respond with HTML page', function (done) {
      agent
        .get(`/articolo/${_article.id}`)
        .set('user-agent', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.html();
  
          done();
        });
    });
    it('HTML should have the FB required meta tags when request is made by the FB crawler', function (done) {
      agent
        .get(`/articolo/${_article.id}`)
        .set('user-agent', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')
        .end(function (err, res) {        
          let _html;
          
          if (err) {
            return done(err);
          }
          
          _html = cheerio.load(res.text);
  
          _html('meta[property="fb:app_id"]').toArray().should.have.length(1);
          _html('meta[property="fb:app_id"]').attr('content').should.be.equal(config.facebook.clientID);
          _html('meta[property="og:title"]').toArray().should.have.length(1);
          _html('meta[property="og:title"]').attr('content').should.be.equal(_article.title);
          _html('meta[property="og:description"]').toArray().should.have.length(1);
          _html('meta[property="og:type"]').toArray().should.have.length(1);
          _html('meta[property="og:type"]').attr('content').should.be.equal('article')
          _html('meta[property="og:locale"]').toArray().should.have.length(1);
          _html('meta[property="og:locale"]').attr('content').should.be.equal('it_IT')
          _html('meta[property="og:determiner"]').toArray().should.have.length(1);
          _html('meta[property="og:determiner"]').attr('content').should.be.equal('an')
          _html('meta[property="og:image"]').toArray().should.have.length(1);
          _html('meta[property="og:image:secure_url"]').toArray().should.have.length(1);
          _html('meta[property="og:updated_time"]').toArray().should.have.length(1);
          done();
        });
    });
});
  });
