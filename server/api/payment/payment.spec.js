'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest'),
      co = require('co'),
      User = require('../user/user.model'),
      Coupon = require('../coupon/coupon.model'),
      agent = request(app),
      config = require('../../config/environment');

require('should-http');

describe.skip('Paypal payments', function() {  
  describe('POST /api/payments/paypal/initRecurring', function() {
    let _token_unqualifiedmassimo;
    
    before(function(done) {
      co(function*() {
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
    
    it('should kick back for non logged user', function(done) {
      agent
        .post('/api/payments/paypal/initRecurring')
        .type('application/json')
        .send({
          subscriptions: ""
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
        
    });
  });
  
  describe(`GET ${config.paypal.returnUrl}?transactionId={transaction_id}&token={paypal_token}`, function() {    
    it('should redirect to a custom page', function(done) {
      agent
        .get(`${config.paypal.returnUrl}?transactionId=SUBSCRIPTIONID&token=T-OKEN`)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(301);
          done();
        });
    });
  });
});
describe('Braintree payments', function() {  
  describe('GET /api/payments/braintree/token', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .get('/api/payments/braintree/token')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    
  });

  describe('GET /api/payments/braintree/plans', function() {
    
    it('should respond with all the configured plans', function(done) {
      this.timeout(5000);
      agent
        .get('/api/payments/braintree/plans')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.body.should.have.properties(Object.keys(config.services));
          
          done();
        });
        
    });
    it('should respond with all the requested properties', function(done) {
      this.timeout(5000);
      agent
        .get('/api/payments/braintree/plans')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.should.matchEach(function(plan) {
            plan.should.have.properties('serviceType', 'price');
          });
          
          done();
        });
        
    });
  });

  describe('GET /api/payments/braintree/addresses', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .get('/api/payments/braintree/addresses')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
  
  });

  describe('GET /api/payments/braintree/paymentMethods', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .get('/api/payments/braintree/paymentMethods')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
  
  });
  
  describe('POST /api/payments/braintree/subscription/{subscription}', function() {    
      let _token_qualifiedfides;

      before(function (done) {
        co(function*() {
          try {
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
    
    it('should kick back for non logged user', function(done) {
      agent
        .post('/api/payments/braintree/subscription/profile-pro')
        .type('application/json')
        .send({
          payment_method_nonce: 'fake-valid-mastercard-nonce'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should kick back when submit request without a billing address', function(done) {
      agent
        .post('/api/payments/braintree/subscription/profile-pro')
        .type('application/json')
        .send({
          payment_method_nonce: 'fake-valid-mastercard-nonce'
        })
        .set('Authorization', `Bearer ${_token_qualifiedfides}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Missing billing address");
          done();
        });
    });
    it('should kick back when submit request with an incomplete billing address', function(done) {
      agent
        .post('/api/payments/braintree/subscription/profile-pro')
        .type('application/json')
        .send({
          payment_method_nonce: 'fake-valid-mastercard-nonce',
          billingDetail: {
            firstName: 'nome',
            lastName: 'cognome'
          }
        })
        .set('Authorization', `Bearer ${_token_qualifiedfides}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Missing billing address component");
          done();
        });
    });
    
  });
  
  describe('DELETE /api/payments/braintree/subscription/{subscription}', function() {    
    let _token_lucaadmin;

    before(function(done) {
      co(function*() {
        try {
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
    
    it('should kick back for non logged user', function(done) {
      agent
        .del('/api/payments/braintree/subscription/profile-pro')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });   
    });
    it('should kick back if admin user do not query a specific user', function(done) {
      agent
        .del('/api/payments/braintree/subscription/profile-pro')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
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