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
}, function(err, responses) {
  if (err) {
    console.log(err);
    return;
  }

  console.log(require('util').inspect(responses, true, 3, true));
});