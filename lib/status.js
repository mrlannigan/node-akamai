'use strict';

// Dependencies
var AkamaiRequest = require('./request').AkamaiRequest,
  constants = require('./constants');

// Akamai Status
// -------------

// Request the status of a purge request. Returns an `AkamaiRequest`.
function AkamaiStatus(username, password, progressUri) {
  var requestOptions,
    auth = {};

  auth.username = username;
  auth.password = password;

  requestOptions = {
    uri: constants.AKAMAI_API_BASE + progressUri,
    method: 'GET',
    auth: auth,
    json: true
  };

  return AkamaiRequest(requestOptions).then(function (response) {
    // Create a function to allow for easy recall of this status call
    response.status = function () {
      return AkamaiStatus(username, password, progressUri);
    };

    return response;
  });
}

// Expose `AkamaiStatus`
exports.AkamaiStatus = AkamaiStatus;
