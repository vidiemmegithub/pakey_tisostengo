'use strict';

const should = require('should'),
      co = require('co'),
      app = require('../../app'),
      request = require('supertest'),
      agent = request(app),
      Article = require('../article/article.model'),
      Message = require('./message.model');

describe('messages API', function() {
  describe('GET /api/messages', function () {
    let _token_lucaadmin, _token_qualifiedclaudio;
    
    before(function(done) {
      let _article;
      
      co(function*() {
        try {
          // get valid token for user: lucaadmin@tsos.com
          _token_lucaadmin = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin'})
              .type('json')
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
              .type('json')
              .end((err, res) => {
                if (err) {
                  reject(err);
                }
                resolve(res.body.token);
              });
          });
          _article = yield Article.find({title: 'Spremitura a freddo: tra moda e dubbi scientifici'}, {'_id': true});
          yield Message.remove();
          yield Message.create([
            {
              type: 'abuse',
              url: 'http://' + process.env.DOMAIN + '/articolo/' + _article.id,
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
        .get('/api/messages')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should kick back a non admin user', function (done) {
      agent
        .get('/api/messages')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should respond with a JSON array of messages', function (done) {
      agent
        .get('/api/messages')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.messages.should.be.an.Array();
          res.body.messages.should.have.length(2);
          
          done();
        });
    });
    it('should respond with paginated data', function (done) {
      agent
        .get('/api/messages')
        .query({per_page: 1, page: 0})
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.messages.should.be.an.Array();
          res.body.messages.should.have.length(1);
          
          done();
        });
    });
    it('should respond only with filtered data types', function (done) {
      agent
        .get('/api/messages')
        .query({q: 'type:abuse'})
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.should.be.json();
          res.body.messages.should.be.an.Array();
          res.body.messages.should.have.length(1);
          
          done();
        });
    });
  
  });
  
  describe('POST /api/messages', function () {
    
    it('should create a new information message', function (done) {
      let _message = {
        type: 'information',
        text: 'lorem ipsum',
        firstname: 'Isaac',
        lastname: 'Newton',
        email: 'isaac@infn.it'
      };
      
      agent
        .post('/api/messages')
        .send(_message)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(204);
  
          Message.findOne(_message, (err, message) => {
            //message.should.not.have.property('resolved_date');
            message.should.have.property('pub_date');
            message.should.have.property('status', 'pending');
            message.should.have.property('type', _message.type);
            message.should.have.property('text', _message.text);
            message.should.have.property('firstname', _message.firstname);
            message.should.have.property('lastname', _message.lastname);
            message.should.have.property('email', _message.email);
            
            message.remove(done);
          });
        });
    });
    it('should reject an information message without email', function (done) {
      let _message = {
        type: 'information',
        text: 'lorem ipsum',
        firstname: 'Isaac',
        lastname: 'Newton'
      };
      
      agent
        .post('/api/messages')
        .send(_message)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(422);
          done();
        });
    });
    it('should reject an information message without firstname', function (done) {
      let _message = {
        type: 'information',
        text: 'lorem ipsum',
        lastname: 'Newton',
        email: 'isaac@infn.it'
      };
      
      agent
        .post('/api/messages')
        .send(_message)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(422);
          done();
        });
    });
    it('should reject an information message without lastname', function (done) {
      let _message = {
        type: 'information',
        text: 'lorem ipsum',
        firstname: 'Isaac',
        email: 'isaac@infn.it'
      };
      
      agent
        .post('/api/messages')
        .send(_message)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(422);
          done();
        });
    });
    it('should reject a technical message without text', function (done) {
      let _message = {
        type: 'technical',
        firstname: 'Isaac',
        lastname: 'Newton',
        email: 'isaac@infn.it'
      };
      
      agent
        .post('/api/messages')
        .send(_message)
        .type('json')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(422);
          done();
        });
    });
    it('should create a new abuse message', function (done) {
      
      Article.find({title: 'Spremitura a freddo: tra moda e dubbi scientifici'}, {'_id': true}, (err, article) => {
        let _message = {
          type: 'abuse',
          url: 'http://' + process.env.DOMAIN + '/articolo/' + article.id,
          text: 'lorem ipsum',
          firstname: 'Isaac',
          lastname: 'Newton',
          email: 'isaac@infn.it'
        };
        
        agent
          .post('/api/messages')
          .send(_message)
          .type('json')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(204);
  
            Message.findOne(_message, (err, message) => {
              //message.should.not.have.property('resolved_date');
              message.should.have.property('pub_date');
              message.should.have.property('status', 'pending');
              message.should.have.property('type', _message.type);
              message.should.have.property('text', _message.text);
              message.should.have.property('url', _message.url);
              message.should.have.property('firstname', _message.firstname);
              message.should.have.property('lastname', _message.lastname);
              message.should.have.property('email', _message.email);
              
              message.remove(done);
            });
          });
      });
    });
    it('should reject an abuse message without an url', function (done) {
      let _message = {
        type: 'abuse',
        text: 'lorem ipsum',
        firstname: 'Isaac',
        lastname: 'Newton',
        email: 'isaac@infn.it'
      };
      
      Article.findOne({title: 'Spremitura a freddo: tra moda e dubbi scientifici'}, {'_id': true}, (err, article) => {
        agent
          .post('/api/messages')
          .send(_message)
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
  
  });
  
  describe('GET /api/messages/{messageId}/resolve', function () {
    let _token_lucaadmin, _token_qualifiedclaudio;
    
    before(function(done) {
      co(function*() {
        try {
          // get valid token for user: lucaadmin@tsos.com
          _token_lucaadmin = yield new Promise((resolve, reject) => {
            agent
              .post('/auth/local')
              .send({'email': 'lucaadmin@tsos.com', 'password': 'lucaadmin'})
              .type('json')
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
              .type('json')
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
        .get('/api/messages/fakeMessageId/resolve')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    
    it('should kick back a non admin user', function (done) {
      agent
        .get('/api/messages/fakeMessageId/resolve')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .send({})
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    
    it('should set message as resolved and not change other properties', function (done) {
      let _message = {
        type: 'information',
        text: 'lorem ipsum',
        firstname: 'Isaac',
        lastname: 'Newton',
        email: 'isaac@infn.it'
      };
      
      Message.create(_message, (err, message) => {
        message.should.have.property('status', 'pending');
        agent
          .get(`/api/messages/${message.id}/resolve`)
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(204);
    
            Message.findById(message.id, (err, message) => {
              message.should.have.property('status', 'resolved');
              message.should.have.property('resolved_date');
              message.should.have.property('type', _message.type);
              message.should.have.property('firstname', _message.firstname);
              message.should.have.property('lastname', _message.lastname);
              message.should.have.property('email', _message.email);
              message.should.have.property('text', _message.text);
              message.remove(done);
            });
          });
      });
    });
});
  });
