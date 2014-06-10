'use strict';

// Validation constants. If any value given for these fields are
// given a warning will be printed.
exports.VALID_TYPES = ['arl', 'cpcode'];
exports.VALID_ACTIONS = ['remove', 'invalidate'];
exports.VALID_DOMAINS = ['production', 'staging'];

// Akamai URLs
exports.AKAMAI_API_BASE = 'https://api.ccu.akamai.com';
exports.AKAMAI_API_QUEUE = exports.AKAMAI_API_BASE + '/ccu/v2/queues/default';

// Chainable request modifiers.  These define the available modifiers that
// help with the configuration of a request to Akamai.  Each modifier will return
// an altered function with a new set of modifiers.  This function, when called,
// will pass the configured options.
exports.MODIFIERS = {
  production: {domain: 'production'},
  staging: {domain: 'staging'},
  cpcode: {type: 'cpcode'},
  url: {type: 'arl'},
  uri: {type: 'arl'},
  arl: {type: 'arl'},
  remove: {action: 'remove'},
  invalidate: {action: 'invalidate'}
};
