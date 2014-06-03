'use strict';

var assert = require('assert'),
  when = require('when'),
  rewire = require('rewire'),
  constants = require('../lib/constants'),
  mocks = require('./mocks');

describe('AkamaiStatus', function () {

  describe('basic status request', function () {
    beforeEach(function () {

      this.progressUri = '/someProgressUri';

      this.object = rewire('./../lib/status.js');
      this.object.__set__('AkamaiRequest', mocks.AkamaiRequest.standardGood({
        uri: constants.AKAMAI_API_BASE + this.progressUri,
        method: 'GET',
        json: true,
        auth: {
          username: 'someusername',
          password: 'supersecret'
        }
      }, {
        httpStatus: 200,
        purgeStatus: 'In-Progress',
        progressUri: this.progressUri
      }));
    });


    it('should make request', function (done) {
      var statusRequest = this.object.AkamaiStatus('someusername', 'supersecret', this.progressUri).then(function (response) {
        assert.equal(response.httpStatus, 200);
        assert.equal(typeof response.status, 'function');
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(statusRequest), true);
    });


    it('should make request then make status request call', function (done) {
      var statusRequest = this.object.AkamaiStatus('someusername', 'supersecret', this.progressUri).then(function (response) {
        assert.equal(response.httpStatus, 200);
        assert.equal(typeof response.status, 'function');

        return response.status();
      }.bind(this)).then(function (statusResponse) {
        assert.equal(statusResponse.httpStatus, 200);
      }).then(done).catch(done);

      assert.equal(when.isPromiseLike(statusRequest), true);
    });

  });
});