'use strict';

var assert = require('assert'),
  when = require('when');

exports.AkamaiRequest = {
  standardGood: function (optionsToAssert, responseToGive) {
    return function (options) {
      assert.deepEqual(options, optionsToAssert);

      return when.promise(function (resolve) {
        resolve(responseToGive);
      });
    };
  }
};

exports.AkamaiStatus = {
  standardGood: function (optionsToAssert, responseToGive) {
    return function AkamaiStatusMock(username, password, progressUri) {
      assert.equal(username, optionsToAssert.username);
      assert.equal(password, optionsToAssert.password);
      assert.equal(progressUri, optionsToAssert.progressUri);

      return when.promise(function (resolve) {
        resolve(responseToGive);
      }).then(function (response) {
        response.status = function () {
          return AkamaiStatusMock(username, password, progressUri);
        };
        return response;
      });
    };
  }
};

exports.request = {
  hardError: function (optionsToAssert, err) {
    return function (options, callback) {
      assert.deepEqual(options, optionsToAssert);

      callback(err);
    };
  },
  statusCodeError: function (optionsToAssert, statusCode, response) {
    return function (options, callback) {
      assert.deepEqual(options, optionsToAssert);

      callback(null, {
        statusCode: statusCode
      }, response);
    };
  },
  goodResponse: function (optionsToAssert, response) {
    return exports.request.statusCodeError(optionsToAssert, 200, response);
  }
};
