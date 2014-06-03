'use strict';

var assert = require('assert'),
  when = require('when'),
  rewire = require('rewire'),
  constants = require('../lib/constants'),
  mocks = require('./mocks');

describe('AkamaiQueueLength', function () {

  describe('basic queue request', function () {
    beforeEach(function () {

      this.object = rewire('./../lib/queue.js');
      this.object.__set__('AkamaiRequest', mocks.AkamaiRequest.standardGood({
        uri: constants.AKAMAI_API_QUEUE,
        method: 'GET',
        json: true,
        auth: {
          username: 'someusername',
          password: 'supersecret'
        }
      }, {
        httpStatus: 200,
        queueLength: 17
      }));
    });


    it('should make request', function (done) {
      var statusRequest = this.object.AkamaiQueueLength('someusername', 'supersecret').then(function (response) {
        assert.equal(response.httpStatus, 200);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(statusRequest), true);
    });

  });
});