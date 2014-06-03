'use strict';

var assert = require('assert'),
  when = require('when'),
  rewire = require('rewire'),
  constants = require('../lib/constants'),
  mocks = require('./mocks');

describe('AkamaiRequest', function () {

  describe('basic request', function () {
    beforeEach(function () {
      this.object = rewire('./../lib/request.js');
      this.requestOptions = {
        uri: '/someuri',
        json: true,
        auth: {
          username: 'someuser',
          password: 'supersecret'
        }
      };
    });


    it('should make request', function (done) {
      this.object.__set__('request', mocks.request.goodResponse(this.requestOptions, {
        httpStatus: 200
      }));


      var request = this.object.AkamaiRequest(this.requestOptions).then(function (response) {
        assert.equal(response.httpStatus, 200);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(request), true);
    });

    it('should make request and handle hard error', function (done) {
      var errToAssert = new Error('test error');
      this.object.__set__('request', mocks.request.hardError(this.requestOptions, errToAssert));


      var request = this.object.AkamaiRequest(this.requestOptions).then(function () {
        done(new Error('should never get here.'));
      }).catch(function (err) {
        try {
          assert.equal(err, errToAssert);

          if (err.toString() === 'Error: test error') {
            done();
          } else {
            done(err);
          }
        } catch (e) {
          done(e);
        }
      });

      assert.equal(when.isPromiseLike(request), true);
    });

    it('should make request and handle statuscode error', function (done) {
      this.object.__set__('request', mocks.request.statusCodeError(this.requestOptions, 403, {
        httpStatus: 403,
        describedBy: 'https://www.example.com/somedescription'
      }));


      var request = this.object.AkamaiRequest(this.requestOptions).then(function () {
        done(new Error('should never get here.'));
      }).catch(function (err) {
        try {
          assert.equal(typeof err.res, 'object');
          assert.equal(/Unexpected status code: 403/.test(err.toString()), true);
          assert.equal(typeof err.body, 'object');
          assert.equal(typeof err.body.describe, 'function');

          if (/Unexpected status code: 403/.test(err.toString())) {
            done();
          } else {
            done(err);
          }
        } catch (e) {
          done(e);
        }
      });

      assert.equal(when.isPromiseLike(request), true);
    });


//    it('should make request then make status request call', function (done) {
//      var statusRequest = this.object.AkamaiStatus('someusername', 'supersecret', this.progressUri).then(function (response) {
//        assert.equal(response.httpStatus, 200);
//        assert.equal(typeof response.status, 'function');
//        assert.deepEqual(response.requestBody, this.requestBody);
//
//        return response.status();
//      }.bind(this)).then(function (statusResponse) {
//        assert.equal(statusResponse.httpStatus, 200);
//      }).then(done).catch(done);
//
//      assert.equal(when.isPromiseLike(statusRequest), true);
//    });

  });
});