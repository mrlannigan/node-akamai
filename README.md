# Akamai API for Node.js

[![Build Status](https://travis-ci.org/mrlannigan/node-akamai.svg)](https://travis-ci.org/mrlannigan/node-akamai)

[![NPM](https://nodei.co/npm/akamai.png?downloads=true&stars=true)](https://nodei.co/npm/akamai/) [![NPM](https://nodei.co/npm-dl/akamai.png?months=6&height=2)](https://nodei.co/npm/akamai/)

node-akamai allows for easy communication with Akamai's REST CCU API to purge/invalidate cached objects.

## Installation

    npm install akamai

## Example Usage

```javascript
var akamai = require('akamai');

akamai.purge('john@example.com', '...', [
  'http://example.com/somewhere',
  'http://example.com/cool',
  'http://example.com/but',
  'http://example.com/nowhere',
  'http://example.com/real'
], {domain: 'staging', action: 'invalidate'}).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.body);
  console.trace();
});

// ===

akamai.invalidate.staging.url('john@example.com', '...', [
  'http://example.com/somewhere',
  'http://example.com/cool',
  'http://example.com/but',
  'http://example.com/nowhere',
  'http://example.com/real'
]).then(function (response) {
  console.log(response);
}).catch(function (err) {
  console.log(err.body);
  console.trace();
});
```

See more examples:
* [basic purge](examples/basic_purge.js)
* [chainable configuration](examples/chainable_purge.js)

## .purge(username, password, objects[, options])

Create a purge request. Returns a promise.

### username

Username of account with access to API.

### password

Password for that account.

### objects

Array of strings representing the full urls/cpcodes of the content you wish to be purged.  Depending on the options.type value, this array can represent cpcode names to be purged/invalidated.

### options

* `type` Of urls. They can be urls or cpcodes.
  * `arl` [Default]
  * `cpcode`
* `domain` The network to target your request.
  * `production` [Default]
  * `staging`
* `action`
  * `remove` [Default]
  * `invalidate`

### response

In the result of the request's promise, the response will contain a `.status` function that is pre-configured to execute a `AkamaiStatus` request with the purge request's `progressUri`.

### Option Modifiers

This library offers a more readable way to set the options for a API request.  See [constants.js](lib/constants.js#L13).  At the root level of this library only the following modifiers are available:

* `remove`
* `invalidate`
* `purge`

All modifier functions only take username, password, and objects as arguments.

## .queue(username, password)

Make a request to check the length of the queue. Returns a promise.

## .status(username, password, progressUri)

Make a request to check status of a given progressUri. Returns a promise.

Note, that if you are using this within a purge request, you will be able to execute `response.status()` to retrieve a request's status in Akamai's queue.

## Changelog

### 0.10.1

* [[b75b6f0](https://github.com/mrlannigan/node-akamai/commit/b75b6f089dff392237b10521c4f2cd1823a0df71)] update travis node versions

### 0.10.0

* Exposed `AkamaiStatus` as `.status` at the module level. Thanks @alex-alexandrescu
* Updated documentation to better explain the usage of `AkamaiStatus` in the response of a purge.

## Bugs or Feature Requests?

Please use GitHub's issue tracker.

## License

Node-Akamai is available under the MIT license

```
Copyright (c) 2014 Julian Lannigan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
