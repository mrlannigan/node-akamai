/*jshint node: true, eqnull: true*/
'use strict';

var akamai = require('../akamai');

var myPurge = new akamai.purge([
  'http://example.com/somewhere',
  'http://example.com/cool',
  'http://example.com/roundthecorner',
  'http://example.com/asdf',
  'http://example.com/test',
  'http://example.com/nowhere'
], {
  user: 'john@example.com',
  password: '...',
  domain: 'staging',
  notify: ['john@example.com', 'developers@example.com']
});

myPurge.on('error', function(err, response, request, urlSet) {
  console.log(err);
  console.log('Request body: ' + request.body);
});

myPurge.on('success', function(responses) {
  console.log('Successful!');
  console.log(require('util').inspect(responses, true, 3, true));
});

myPurge.on('request-success', function(response) {
  console.log('API Call Successfully completely in ' + response.responseTime + 'ms and Akamai is reporting that the request should take about ' + response.estTime + ' seconds.');
});