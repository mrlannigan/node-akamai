'use strict';

// Dependencies
var request = require('request'),
  when = require('when');

// Akamai Request
// --------------

// This function will execute a web request and return a promise.
function AkamaiRequest (requestOptions) {
  // Create said promise
  return when.promise(function (resolve, reject) {
    // Initiate request
    request(requestOptions, function (err, res, response) {
      if (err) {
        // Reject the promise
        return reject(err);
      }
      // Check the status code is a 2xx code
      else if (res.statusCode < 200 || res.statusCode > 299) {
        err = new Error('Unexpected status code: ' + res.statusCode);
        err.res = res;

        // If the response has a `describeBy` property, we will create a helper function to
        // request that url to retrieve Akamai's description of this error. Obviously
        // the added `describe` function may not always exist. Please make sure it exists
        // before using. Will return a promise.
        if (response && response.hasOwnProperty('describedBy')) {
          response.describe = function () {
            return AkamaiRequest({
              method: 'GET',
              uri: response.describedBy
            });
          };
        }

        // Expose the response
        err.body = response || null;

        // Reject the promise
        return reject(err);
      }

      // Resolve the promise with the response
      return resolve(response);
    });
  });
}

// Expose the `AkamaiRequest`
exports.AkamaiRequest = AkamaiRequest;
