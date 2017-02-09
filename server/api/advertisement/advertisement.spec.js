'use strict';

const should = require('should'),
      app = require('../../app'),
      request = require('supertest');

require('should-http');

describe('Advertisement API:', function() {

  describe('GET /api/advertisements', function() {
    var advertisement;

    beforeEach(function(done) {
      request(app)
        .get('/api/advertisements')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          
          advertisement = res.body;
          done();
        });
    });

    it.skip('should respond with a "data" URL of a picture', function() {
      advertisement.picture.should.be.String().and.match(/^data:image\/png;base64,/);
      advertisement.link.should.be.String().and.match(/^htt/);
    });

  });

});
