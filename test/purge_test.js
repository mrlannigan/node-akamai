'use strict';

var assert = require('assert'),
  when = require('when'),
  rewire = require('rewire'),
  lodash = require('lodash'),
  constants = require('../lib/constants'),
  mocks = require('./mocks');

describe('AkamaiPurge', function () {

  describe('#warn()', function () {
    before(function () {
      this.AkamaiPurge = rewire('./../lib/purge.js');
      this.AkamaiPurge.__set__('console', {
        warn: function (msg) {
          assert.equal(msg, 'akamai: WARNING: Test warning');
        }
      });
    });


    it('should output using console.warn', function () {
      this.AkamaiPurge.__get__('warn')('Test warning');
    });
  });

  describe('basic purge request', function () {
    beforeEach(function () {

      this.requestObjects = [
        'http://www.example.com/somewhere'
      ];

      this.requestBody = {
        objects: this.requestObjects
      };

      this.object = rewire('./../lib/purge.js');
      this.object.__set__('AkamaiRequest', mocks.AkamaiRequest.standardGood({
        uri: constants.AKAMAI_API_QUEUE,
        method: 'POST',
        json: this.requestBody,
        auth: {
          username: 'someusername',
          password: 'supersecret'
        }
      }, {
        httpStatus: 201,
        detail: 'Request accepted.',
        progressUri: '/someProgressUri'
      }));

      this.object.__set__('AkamaiStatus', mocks.AkamaiStatus.standardGood({
        username: 'someusername',
        password: 'supersecret',
        progressUri: '/someProgressUri'
      }, {
        httpStatus: 201,
        detail: 'Request accepted.',
        progressUri: '/someProgressUri'
      }));
    });


    it('should make request', function (done) {
      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request with bad options primitive type', function (done) {
      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects, 'badoptions').then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request then make status request call', function (done) {
      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);

        return response.status();
      }.bind(this)).then(function (statusResponse) {
        assert.equal(statusResponse.httpStatus, 201);
      }).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request without progress uri then make status request call', function (done) {
      this.object.__set__('AkamaiRequest', mocks.AkamaiRequest.standardGood({
        uri: constants.AKAMAI_API_QUEUE,
        method: 'POST',
        json: this.requestBody,
        auth: {
          username: 'someusername',
          password: 'supersecret'
        }
      }, {
        httpStatus: 201,
        detail: 'Request accepted.'
      }));

      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);

        return response.status();
      }.bind(this)).then(function () {
        throw new Error('Should have failed in the status call');
      }).catch(function (err) {
        try {
          assert.equal(err instanceof Error, true);
          if (/progressUri/.test(err.toString())) {
            assert.equal(err.toString(), 'Error: Missing progressUri from response');
            done();
          } else {
            done(err);
          }
        } catch (e) {
          done(e);
        }
      });

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });
  });

  describe('purge request options', function () {
    beforeEach(function () {
      this.object = rewire('./../lib/purge.js');

      this.requestObjects = [
        'http://www.example.com/somewhere'
      ];

      this.requestBody = {
        objects: this.requestObjects
      };

      this.requestOptions = {
        uri: constants.AKAMAI_API_QUEUE,
        method: 'POST',
        json: this.requestBody,
        auth: {
          username: 'someusername',
          password: 'supersecret'
        }
      };

      this.applyMock = function (additionalOptions) {
        this.requestBody = lodash.assign(this.requestBody, additionalOptions);
        this.requestOptions.json = this.requestBody;

        this.object.__set__('AkamaiRequest', mocks.AkamaiRequest.standardGood(this.requestOptions, {
          httpStatus: 201,
          detail: 'Request accepted.',
          progressUri: '/someProgressUri'
        }));
      }.bind(this);
    });


    it('should make request with type option given', function (done) {
      this.applyMock({type: 'cpcode'});

      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects, {type: 'cpcode'}).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request with bad type option given', function (done) {
      this.applyMock({});
      this.object.__set__('console', {
        warn: function (msg) {
          assert.equal(/akamai: WARNING: Invalid purge request type\. Valid types:/.test(msg), true);
        }
      });

      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects, {type: 'badtype'}).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request with domain option given', function (done) {
      this.applyMock({domain: 'production'});

      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects, {domain: 'production'}).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request with bad domain option given', function (done) {
      this.applyMock({});
      this.object.__set__('console', {
        warn: function (msg) {
          assert.equal(/akamai: WARNING: Invalid purge request domain\. Valid domains:/.test(msg), true);
        }
      });

      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects, {domain: 'baddomain'}).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request with action option given', function (done) {
      this.applyMock({action: 'invalidate'});

      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects, {action: 'invalidate'}).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request with bad action option given', function (done) {
      this.applyMock({});
      this.object.__set__('console', {
        warn: function (msg) {
          assert.equal(/akamai: WARNING: Invalid purge request action\. Valid actions:/.test(msg), true);
        }
      });

      var purgeRequest = this.object.AkamaiPurge('someusername', 'supersecret', this.requestObjects, {action: 'badaction'}).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });


    it('should make request using object modifiers', function (done) {
      this.applyMock({type: 'cpcode', domain: 'staging'}, true);

      var purgeRequest = this.object.AkamaiPurge.staging.cpcode('someusername', 'supersecret', this.requestObjects).then(function (response) {
        assert.equal(response.httpStatus, 201);
        assert.equal(typeof response.status, 'function');
        assert.deepEqual(response.requestBody, this.requestBody);
      }.bind(this)).then(done).catch(done);

      assert.equal(when.isPromiseLike(purgeRequest), true);
    });
  });
});