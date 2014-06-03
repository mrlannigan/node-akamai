'use strict';

var akamai = require('../akamai');

akamai.purge('myusername@example.com', 'secretpassword', [
  'http://www.example.com/somewhere',
  'http://www.example.com/cool'
]).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.toString());
  console.log(err.body);
});