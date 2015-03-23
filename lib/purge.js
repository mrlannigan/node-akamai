'use strict';

// Dependencies
var when = require('when'),
  lodash = require('lodash'),
  constants = require('./constants'),
  AkamaiRequest = require('./request').AkamaiRequest,
  AkamaiStatus = require('./status').AkamaiStatus,
  WrappedConsole = require('./utility').wrappedConsole,
  wp = new WrappedConsole(),
  warn = wp.warn.bind(wp);

wp.setWarnPrefix('akamai: WARNING: ');

// Akamai Purge
// ------------

// Cornerstone function that sends a purge request to Akamai's CCU REST API
// It will return a promise. `options` is optional.
function AkamaiPurge(username, password, objects, options) {
  var auth = {},
    requestBody = {},
    requestOptions;

  // Ensure options exist and are the right type
  if (options === undefined || !lodash.isPlainObject(options)) {
    options = {};
  }

  // Prepare authentication
  auth.username = username;
  auth.password = password;

  // Validate the given type
  if (-1 !== constants.VALID_TYPES.indexOf(options.type)) {
    requestBody.type = options.type;
  } else if (options.hasOwnProperty('type')) {
    warn('Invalid purge request type. Valid types: [' + constants.VALID_TYPES.join(', ') + ']. Given: ' + options.type);
  }

  // Validate the given domain
  if (-1 !== constants.VALID_DOMAINS.indexOf(options.domain)) {
    requestBody.domain = options.domain;
  } else if (options.hasOwnProperty('domain')) {
    warn('Invalid purge request domain. Valid domains: [' + constants.VALID_DOMAINS.join(', ') + ']. Given: ' + options.domain);
  }

  // Validate the given action
  if (-1 !== constants.VALID_ACTIONS.indexOf(options.action)) {
    requestBody.action = options.action;
  } else if (options.hasOwnProperty('action')) {
    warn('Invalid purge request action. Valid actions: [' + constants.VALID_ACTIONS.join(', ') + ']. Given: ' + options.action);
  }

  // Append objects to the request body
  requestBody.objects = objects;

  // Prepare request's options
  requestOptions = {
    uri: constants.AKAMAI_API_QUEUE,
    method: 'POST',
    json: requestBody,
    auth: auth
  };

  // Reset all modifiers
  applyModifiers(AkamaiPurge);

  // Create request and return the promise
  return AkamaiRequest(requestOptions).then(function (response) {
    // Do some post-processing on the response
    response.requestBody = requestBody;

    // Add a status function that pre-configured to call this purge's `progressUri`
    response.status = function () {
      // If this purge doesn't have a `progressUri`, return a rejection
      if (!response.hasOwnProperty('progressUri')) {
        return when.reject(new Error('Missing progressUri from response'));
      }

      // Otherwise, call `AkamaiStatus`
      return AkamaiStatus(username, password, response.progressUri);
    };

    return response;
  });
}

// Modifiers
// ---------

// Alter `object` with getters defined by `constants.MODIFIERS`
// and also maintain "current" set of options. This creates a kind of
// recursive and chainable configuration for the impending request to Akamai.
function applyModifiers(object, options) {
  options = options || {};

  lodash.forEach(constants.MODIFIERS, function (modifier, property) {
    Object.defineProperty(object, property, {
      // Allow the property to be shown/looped
      enumerable: true,
      // Allow the property to be reset
      configurable: true,
      // Returns a new function pre-configured with the options that exist up to this point
      get: function () {
        // Apply the modifier to the current `options`
        options = lodash.assign(options, modifier);

        // Create new wrapper function.
        var AkamaiPurgeChain = function AkamaiPurgeChain (username, password, objects) {
          return AkamaiPurge(username, password, objects, options);
        };

        // Apply new modifiers to given wrapper function
        applyModifiers(AkamaiPurgeChain, options);

        // Expose current `options`
        AkamaiPurgeChain.options = options;

        return AkamaiPurgeChain;
      }
    });
  });
}

// Apply modifiers
applyModifiers(AkamaiPurge);

// Expose `AkamaiPurge`
exports.AkamaiPurge = AkamaiPurge;

// Expose private functions for testing
Object.defineProperties(exports, {
  _warn: {
    configurable: true,
    writable: true,
    value: warn
  },
  _applyModifiers: {
    configurable: true,
    value: applyModifiers
  }
});