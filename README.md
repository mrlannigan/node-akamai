# Akamai API for Node.js

node-akamai allows for easy communication with Akamai's SOAP CCUAPI to purge/invalidate cached objects.

***Note: The API for this module is going to be changing in the near future to better wrap the different functions the purge API provides.***

## Installation

    npm install akamai

## Example Usage

```javascript
var akamai = require('akamai');

var myPurge = new akamai.purge([
  'http://example.com/somewhere',
  'http://example.com/cool',
  'http://example.com/but',
  'http://example.com/nowhere',
  'http://example.com/real'
], {
  user: 'john@example.com',
  password: '...',
  domain: 'production',
  notify: ['john@example.com', 'developers@example.com']
}, function(err, responses) {
  if (err) {
    console.log(err);
    return;
  }

  console.log(require('util').inspect(responses, true, 3, true));
});
```

##.purge(urls, options, [callback])

Create a purge request. Note that any request made must declared with the `new` keyword.  The resulting object is an extension of the `EventEmitter` so you are able to attach to the various events that are listed below.

### urls

Array of strings representing the full urls of the content you wish to be purged.  Depending on the options.type value, this array can represent cpcode names to be purged/invalidated.

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
* `user` [Required] Username to authenicate with the API.
* `password` [Required] Password for the user.
* `notify` [Required] String or Array of Strings representing email address(es).

### callback(err, responses)

Provides 2 arguments, the error object and the responses array.  The error object is null if no error occurred.  The responses array contains instances of the `AkamaiPurgeResponse` class.  This class parses and describes the response from the API.

### events

#### `error`
```js
myPurge.on('error', function(err, response, request, urlSet) {
  console.log(err);
});
```

#### `success`
```js
myPurge.on('success', function(responses) {
  console.log(responses);
});
```

#### `request-success`
```js
myPurge.on('request-success', function(response) {
  console.log(response);
});
```

## Bugs or Feature Requests?

Please use GitHub's issue tracker.

## License

Node-Akamai is available under the MIT license

```
Copyright (c) 2012 Julian Lannigan

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