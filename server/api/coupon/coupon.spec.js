'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest'),
      co = require('co'),
      User = require('../user/user.model'),
      Coupon = require('./coupon.model'),
      agent = request(app),
      config = require('../../config/environment');

require('should-http');

describe('coupons', function() {
  let _token_lucaadmin, _token_qualifiedclaudio;
  
  before(function(done) {
    co(function*() {
      // get valid token for user: unqualifiedmassimo@tsos.com
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
    });
  });
  
  describe('GET /api/coupons', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .get('/api/coupons')
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should kick back for non admin user', function(done) {
      agent
        .get('/api/coupons')
        .query({
          per_page: 2,
          page: 0
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
    it('should respond with paginated data', function(done) {
      agent
        .get('/api/coupons')
        .query({
          per_page: 2,
          page: 0
        })
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.body.coupons.should.be.an.Array();
          res.body.coupons.should.have.length(2);
          
          done();
        });
    });
    it('should respond with sorted data', function(done) {
      agent
        .get('/api/coupons')
        .query({
          s: 'validity|DESC'
        })
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          new Date(res.body.coupons[0].validity).getTime().should.be.above(new Date(res.body.coupons[1].validity).getTime());
          
          done();
        });
    });
    it('should respond only with enabled coupons', function(done) {
      agent
        .get('/api/coupons')
        .query({
          q: 'enabled:true'
        })
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.body.coupons.should.have.length(4);
          res.body.coupons.should.matchEach(function(coupon) {
            coupon.enabled.should.be.true();
          });
          
          done();
        });
    });
    
  });
  
  describe('GET /api/coupons/{couponId}', function() {
    let _coupon;
    
    before(function(done) {
      Coupon.findOne({}, function(err, coupon) {
        _coupon = coupon;
        done();
      });
    });
    
    it('should kick back for non logged user', function(done) {
      agent
        .get(`/api/coupons/${_coupon.id}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should kick back for non admin user', function(done) {
      agent
        .get(`/api/coupons/${_coupon.id}`)
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          
          done();
        });
    });
    it('should respond with valid coupon', function(done) {
      agent
        .get(`/api/coupons/${_coupon.id}`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(200);
          res.body._id.should.be.equal(_coupon.id);
          
          done();
        });
    });
    
  });
  
  describe('GET /api/coupons/verify/{text}/{service}', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .get(`/api/coupons/verify/AAAA/AAAA`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should respond with an error for a not existing coupon', function(done) {
      agent
        .get(`/api/coupons/verify/67676767/ranking`)
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(500);
          res.text.should.be.equal("Coupon non esistente");
          
          done();
        });
    });
    it('should respond with an error for a coupon linked to a different service', function(done) {
      Coupon.findOne({service: 'profile-pro'}, function(err, coupon) {
        agent
          .get(`/api/coupons/verify/${coupon.text}/ranking`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(500);
            res.text.should.be.equal("Coupon non utilizzabile per questo servizio");
            
            done();
          });
      });
    });
    it('should respond with an error for a not enabled coupon', function(done) {
      Coupon.findOne({enabled: false}, function(err, coupon) {
        agent
          .get(`/api/coupons/verify/${coupon.text}/${coupon.service}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(500);
            res.text.should.be.equal("Coupon non valido");
            done();
          });
      });
    });
    it('should respond with an error for expired coupon', function(done) {
      Coupon.findOne({validity: new Date(1915,0,31)}, function(err, coupon) {
        agent
          .get(`/api/coupons/verify/${coupon.text}/${coupon.service}`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(500);
            res.text.should.be.equal("Coupon scaduto");
            done();
          });
      });
    });
    it('should respond with an error if the user has already used this coupon', function(done) {
      Coupon.findOne({text: 'AGYFY567'}, function(err, coupon) {
        User.findOneAndUpdate({email: 'qualifiedclaudio@tsos.com'}, {'$addToSet': {'usedCoupons': [coupon.text]}}, function(err, user) {
          agent
            .get(`/api/coupons/verify/${coupon.text}/${coupon.service}`)
            .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              
              res.should.have.status(500);
              res.text.should.be.equal("Coupon già utilizzato");
              
              user.usedCoupons = [];
              user.markModified('usedCoupons');
              user.save(done);
            });
        });
      });
    });
    it('should respond with the coupon for an enabled one', function(done) {
      Coupon.findOne({service: 'profile-pro'}, function(err, coupon) {
        agent
          .get(`/api/coupons/verify/${coupon.text}/profile-pro`)
          .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(200);
            res.body.should.have.property('_id', coupon.id);
            res.body.should.have.property('text', coupon.text);
            res.body.should.have.property('amount', coupon.amount);
            res.body.should.have.property('numberOfBillingCycles', coupon.numberOfBillingCycles);
            res.body.should.have.property('neverExpires', false);
            
            done();
          });
      });
    });
    
  });
  
  describe('POST /api/coupons', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .post('/api/coupons')
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          validity: new Date(2016,11,31),
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
        
    });
    it('should kick back for non admin user', function(done) {
      agent
        .post('/api/coupons')
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          validity: new Date(2016,11,31),
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should return error if we don\'t specify a valid expiration date', function(done) {
      agent
        .post('/api/coupons')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          numberOfBillingCycles: 1,
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Data di scadenza non valida");
          done();
        });
    });
    it('should return error if we use an expired date', function(done) {
      agent
        .post('/api/coupons')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          validity: new Date(2010,11,31),
          numberOfBillingCycles: 1,
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Data di scadenza non valida");
          done();
        });
    });
    it('should return error if we don\'t specify a valid amount', function(done) {
      agent
        .post('/api/coupons')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          numberOfBillingCycles: 1,
          validity: new Date(2016,11,31),
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Ammontare di sconto non specificato");
          done();
        });
    });
    it('should return error if we don\'t specify a valid service', function(done) {
      agent
        .post('/api/coupons')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .send({
          service: 'profile',
          validity: new Date(2016,11,31),
          numberOfBillingCycles: 1,
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(400);
          res.text.should.be.equal("Il servizio specificato è inesatto");
          done();
        });
    });
    it('should create and return a valid never ending coupon', function(done) {
      agent
        .post('/api/coupons')
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          validity: new Date(2020,11,31),
          amount: '0.10',
          neverExpires: true
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(201);
          res.body.inheritedFromId.should.be.equal(config.braintree.discountTemplate);
          res.body.service.should.be.equal(Object.keys(config.services)[0]);
          new Date(res.body.validity).should.be.eql(new Date(2020,11,31));
          res.body.amount.should.be.equal('0.10');
          res.body.enabled.should.be.true();
          res.body.neverExpires.should.be.true();
          res.body.should.not.have.property('numberOfBillingCycles');
          res.body.text.should.be.a.String().and.have.length(8).and.match(/^[A-Z0-9]*$/);
          res.body.should.have.property('createdAt');
          
          Coupon.count({}, function(err, count) {
            count.should.be.equal(6);
            
            Coupon.findOne({validity: new Date(2020,11,31)}, function(err, coupon) {
              let braintreeDiscountObj = coupon.extractDiscountInformation();
               
              braintreeDiscountObj.should.have.property('inheritedFromId', config.braintree.discountTemplate);
              braintreeDiscountObj.should.have.property('amount', '0.10');
              braintreeDiscountObj.should.have.property('neverExpires', true);
              braintreeDiscountObj.should.have.property('numberOfBillingCycles', undefined);
              
              coupon.remove(done);
            });
          });
        });
    });

  });

  describe('PUT /api/coupons/{couponId}', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .put(`/api/coupons/afgbert4t534g3`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          validity: new Date(2016,11,31),
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
        
    });
    it('should kick back for non admin user', function(done) {
      agent
        .put(`/api/coupons/afgbert4t534g3`)
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          validity: new Date(2016,11,31),
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should respond with an error for a not existing coupon', function(done) {
      agent
        .put(`/api/coupons/afgbert4t534g3`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .type('application/json')
        .send({
          service: Object.keys(config.services)[0],
          validity: new Date(2016,11,31),
          amount: '0.10'
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(500);
          
          done();
        });
    });
    it('should not change immutable fields', function(done) {
      Coupon.create({
          inheritedFromId: config.braintree.discountTemplate, 
          amount: '0.10',
          text: 'AERFY567',
          service: Object.keys(config.services)[0],
          validity: new Date(2016,11,31)
        }, function(err, coupon) {
          agent
            .put(`/api/coupons/${coupon.id}`)
            .set('Authorization', `Bearer ${_token_lucaadmin}`)
            .type('application/json')
            .send({
              inheritedFromId: 'un altro',
              service: Object.keys(config.services)[1],
              validity: new Date(2050,11,31),
              amount: '10.10',
              numberOfBillingCycles: 10,
              text: 'un altro codice',
              usedTimes: 100,
              enabled: false,
              neverExpires: true
            })
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              
              res.should.have.status(200);
              res.body.inheritedFromId.should.be.equal(config.braintree.discountTemplate);
              res.body.amount.should.be.equal("0.10");
              res.body.text.should.be.equal("AERFY567");
              res.body.service.should.be.equal(Object.keys(config.services)[0]);
              res.body.validity.should.be.equal(new Date(2016,11,31).toJSON());
              res.body.numberOfBillingCycles.should.be.equal(1);
              res.body.usedTimes.should.be.equal(0);
              res.body.enabled.should.be.false();
              res.body.neverExpires.should.be.false();
              
              coupon.remove(done);
            });
        });
    });
    
  });

  describe('DELETE /api/coupons/{couponId}', function() {
    
    it('should kick back for non logged user', function(done) {
      agent
        .del(`/api/coupons/afgbert4t534g3`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
        
    });
    it('should kick back for non admin user', function(done) {
      agent
        .del(`/api/coupons/afgbert4t534g3`)
        .set('Authorization', `Bearer ${_token_qualifiedclaudio}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(403);
          done();
        });
    });
    it('should respond with an error for a not existing coupon', function(done) {
      agent
        .del(`/api/coupons/afgbert4t534g3`)
        .set('Authorization', `Bearer ${_token_lucaadmin}`)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          
          res.should.have.status(500);
          
          done();
        });
    });
    it('should remove a coupon', function(done) {
      Coupon.create({
          inheritedFromId: 'hcnr', 
          amount: '0.10',
          text: 'AG333567',
          service: Object.keys(config.services)[0],
          validity: new Date(2016,11,31)
        }, function(err, coupon) {
        agent
          .del(`/api/coupons/${coupon.id}`)
          .set('Authorization', `Bearer ${_token_lucaadmin}`)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            
            res.should.have.status(204);
            Coupon.findById(coupon.id, function(err, coupon) {
                
                coupon.enabled.should.be.false();
                
                coupon.remove(done);
              });
          });
      });
    });
    
  });
});
