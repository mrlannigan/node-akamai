'use strict';

// Dependencies
var AkamaiRequest = require('./request').AkamaiRequest,
  constants = require('./constants');

// Akamai Queue Length
// -------------------

// Request your accounts current object queue status/length. Returns an `AkamaiRequest`.
function AkamaiQueueLength(username, password) {
  var requestOptions,
    auth = {};

  auth.username = username;
  auth.password = password;

  requestOptions = {
    uri: constants.AKAMAI_API_QUEUE,
    method: 'GET',
    auth: auth,
    json: true
  };

  return AkamaiRequest(requestOptions);
}

// Expose `AkamaiQueueLength`
exports.AkamaiQueueLength = AkamaiQueueLength;