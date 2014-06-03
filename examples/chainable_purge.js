'use strict';

var akamai = require('../akamai');

var objects = [
  'http://www.example.com/somewhere',
  'http://www.example.com/cool'
];

// Example 1
// ---------

akamai.purge.staging.uri('myusername@example.com', 'secretpassword', objects).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.toString());
  console.log(err.body);
});

// ==

akamai.purge('myusername@example.com', 'secretpassword', objects, {
  type: 'arl',
  domain: 'staging'
}).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.toString());
  console.log(err.body);
});


// Example 2
// ---------

akamai.remove.production.cpcode('myusername@example.com', 'secretpassword', objects).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.toString());
  console.log(err.body);
});

// ==

akamai.purge('myusername@example.com', 'secretpassword', objects, {
  type: 'cpcode',
  action: 'remove',
  domain: 'production'
}).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.toString());
  console.log(err.body);
});


// Example 3
// ---------

akamai.invalidate.production.url('myusername@example.com', 'secretpassword', objects).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.toString());
  console.log(err.body);
});

// ==

akamai.purge('myusername@example.com', 'secretpassword', objects, {
  type: 'arl',
  action: 'invalidate',
  domain: 'production'
}).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.toString());
  console.log(err.body);
});