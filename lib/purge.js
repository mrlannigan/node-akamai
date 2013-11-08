/*jshint node: true, eqnull: true*/

'use strict';

// Dependencies
var util = require('util'),
  Emitter = require('events').EventEmitter,
  _ = require('underscore'),
  xml2js = require('xml2js'),
  async = require('async'),
  request = require('request');

// Constants
var VALID_TYPES = ['arl', 'cpcode'],
  VALID_ACTIONS = ['remove', 'invalidate'],
  VALID_DOMAINS = ['production', 'staging'],
  AKAMAI_API_PURGE = 'https://ccuapi.akamai.com:443/soap/servlet/soap/purge',
  AKAMAI_SOAP_ACTION = 'http://ccuapi.akamai.com/purge#purgeRequest',
  AKAMAI_URIS_PER_REQUEST = 100;


/**
 * Akamai Purge Request Body
 * @class
 * @param {Array}  urls
 * @param {Object} options
 */
function AkamaiPurgeRequestBody(urls, options) {
  // check to see if you using this as a constructor
  if (false === this instanceof AkamaiPurgeRequestBody) {
    throw new Error('Must use AkamaiPurgeRequestBody as constructor (hint: use the new keyword)');
  }

  this.urls = urls || [],
  this.options = options || {};
}

AkamaiPurgeRequestBody.prototype.toXML = function() {
  return this.toString();
};

AkamaiPurgeRequestBody.prototype.toString = function() {
  var urls = this.urls,
    options = this.options,
    bodyURIs = '',
    bodyCreds = '',
    bodyOpts = '',
    requestBody = '',
    purgeOpts = [];

  // option = type
  if (-1 !== VALID_TYPES.indexOf(options.type)) {
    purgeOpts.push(util.format('%s=%s', 'type', options.type));
  }

  // option = domain
  if (-1 !== VALID_DOMAINS.indexOf(options.domain)) {
    purgeOpts.push(util.format('%s=%s', 'domain', options.domain));
  }

  // option = action
  if (-1 !== VALID_ACTIONS.indexOf(options.action)) {
    purgeOpts.push(util.format('%s=%s', 'action', options.action));
  }

  // option = notify
  if (options.notify) {
    var notify = options.notify;

    if (notify instanceof Array) {
      notify = notify.join(',');
    }

    purgeOpts.push(util.format('%s=%s', 'email-notification', options.notify));
  }

  // generate xml for user credentials
  if (options.user) {
    bodyCreds += util.format('<name xsi:type="xsd:string">%s</name>', options.user);
  }
  if (options.password) {
    bodyCreds += util.format('<pwd xsi:type="xsd:string">%s</pwd>', options.password);
  }

  // generate xml for purge options
  if (purgeOpts.length) {
    purgeOpts.forEach(function(option) {
      bodyOpts += util.format('<item xsi:type="xsd:string">%s</item>', option);
    });
    bodyOpts = util.format('<opt soapenc:arrayType="xsd:string[%d]" xsi:type="soapenc:Array">%s</opt>', purgeOpts.length, bodyOpts);
  }

  // generate xml for uris
  if (urls instanceof Array && 0 < urls.length) {
    urls.forEach(function(url) {
      bodyURIs += util.format('<item xsi:type="xsd:string">%s</item>', url);
    });
    bodyURIs = util.format('<uri soapenc:arrayType="xsd:string[%d]" xsi:type="soapenc:Array">%s</uri>', urls.length, bodyURIs);
  }

  // generate entire xml body request
  requestBody = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">',
      '<soap:Body>',
        '<purgeRequest xmlns="http://ccuapi.akamai.com/purge">',
          bodyCreds,
          bodyOpts,
          bodyURIs,
          '<network xsi:type="xsd:string"></network>',
        '</purgeRequest>',
      '</soap:Body>',
    '</soap:Envelope>'
  ].join('');

  return requestBody;
};

/**
 * Akamai XML Response Parser
 * @class
 * @param {String}   rawBody  Body of response
 * @param {Function} callback [Optional] (err, this)
 */
function AkamaiPurgeResponse(rawBody, callback) {
  var body, keys;

  // check to see if you using this as a constructor
  if (false === this instanceof AkamaiPurgeResponse) {
    throw new Error('Must use AkamaiPurgeResponse as constructor (hint: use the new keyword)');
  }

  Object.defineProperties(this, {
    '_body': {
      enumerable: false,
      get: function() { return body; },
      set: function(value) { body = value; }
    },
    '_keys': {
      enumerable: false,
      get: function() { return keys; },
      set: function(value) { keys = value; }
    }
  });

  this.setBody(rawBody).process(callback);
}

AkamaiPurgeResponse.prototype.process = function(callback) {
  var parser = new xml2js.Parser(), result;

  this.reset();

  var _callback = function(err) {
    this.error = err;
    if (callback) { callback(err, this); }
    result = this;
  }.bind(this);

  parser.parseString(this._body, function (err, result) {
    if (err) { return _callback(err); }

    if (!result['SOAP-ENV:Envelope'] || !result['SOAP-ENV:Envelope']['SOAP-ENV:Body'] || 1 > result['SOAP-ENV:Envelope']['SOAP-ENV:Body'].length) {
      return _callback(new Error('Invalid purge response'));
    }

    var body = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'].shift();

    if (body['SOAP-ENV:Fault']) {
      try {
        var error = new Error(body['SOAP-ENV:Fault'][0].faultstring[0]);
        error.fault = true;
        return _callback(error);
      } catch (e) {
        return _callback(new Error('Invalid server purge fault response'));
      }
    }

    if (body['ns0:purgeRequestResponse']) {
      try {
        var purgeResult = body['ns0:purgeRequestResponse'][0]['return'][0];
        Object.keys(purgeResult).forEach(function(key) {
          if (!purgeResult[key][0] || !purgeResult[key][0]._) { return; }
          this[key] = purgeResult[key][0]._;
          this._keys.push(key);
        }.bind(this));

        // we have an error code
        if (!this.resultCode || 300 <= this.resultCode) {
          return _callback(new Error(this.resultMsg || 'Unknown response error (CCUAPI code: ' + (this.resultCode || 'Unknown') + ')'));
        }

        return _callback(null);
      } catch (e) {
       return _callback(new Error('Invalid server purge response'));
      }
    }

    return _callback(new Error('Unknown server response'));
  }.bind(this));

  return result;
};

AkamaiPurgeResponse.prototype.hasError = function() {
  return !!this.error;
};

AkamaiPurgeResponse.prototype.getError = function() {
  return this.error || null;
};

AkamaiPurgeResponse.prototype.reset = function() {
  (this._keys || []).forEach(function(key) {
    delete this[key];
  });
  this._keys = [];
};

AkamaiPurgeResponse.prototype.setBody = function(rawBody) {
  this._body = rawBody || '';
  return this;
};

/**
 * Purge Request
 * @class
 * @param {Array}    urls
 * @param {Object}   options
 * @param {Function} callback (err, responses)
 */
function AkamaiPurgeRequest(urls, options, callback) {
  var startTime = new Date();

  // check to see if you using this as a constructor
  if (false === this instanceof AkamaiPurgeRequest) {
    throw new Error('Must use AkamaiPurgeRequest as constructor (hint: use the new keyword)');
  }

  // prepare request body
  this.body = new AkamaiPurgeRequestBody(urls, options);

  // make the request
  this.api = request({
    method: 'POST',
    url: AKAMAI_API_PURGE,
    headers: {
      'SOAPAction': AKAMAI_SOAP_ACTION,
      'Content-Type': 'text/xml; charset="UTF-8"'
    },
    body: this.body.toXML()
  }, function(err, response, body) {
    if (err) { return callback(err); }

    // parse response body
    var res = new AkamaiPurgeResponse(body);
    res.responseTime = new Date() - startTime;
    res.request = this;

    callback(res.getError(), res);
  }.bind(this));
}

function AkamaiPurge(urls, options, callback) {
  var queuedUrls = [], mapper;

  // check to see if you using this as a constructor
  if (false === this instanceof AkamaiPurge) {
    return new AkamaiPurge(urls, options, callback);
  }

  // argument flippy-flop
  if (!_.isArray(urls) && _.isObject(urls)) {
    options = _.clone(urls);
    if (options.urls) { urls = options.urls; }
  }

  // argument flippy-flop
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  // do any options exist?
  if (false === options instanceof Object) { options = {}; }

  // find a callback to use
  if (false === callback instanceof Function) {
    if (options.callback instanceof Function) {
      callback = options.callback;
    } else if (options.complete instanceof Function) {
      callback = options.complete;
    } else {
      callback = function() {};
    }
  }

  // apply defaults
  options = _.extend({
    type: 'arl',
    domain: 'production',
    action: 'remove'
  }, options);

  // clean urls/cpcodes array
  urls = _.uniq(urls);

  // prepare urls into separate arrays, which will directly correspond with
  // the number of requests that must be made to the CCUAPI
  urls.forEach(function(url, index) {
    var queueIndex = Math.floor(index / AKAMAI_URIS_PER_REQUEST);
    if (!queuedUrls[queueIndex]) { queuedUrls[queueIndex] = []; }
    queuedUrls[queueIndex].push(url);
  });

  // iterator function for the map
  mapper = function(urlSet, callback) {
    var _callback, request;

    _callback = function(err, response) {
      process.nextTick(function() {
        if (err) {
          if (this._events && this._events.error) { // only emit error if it's bound.
            this.emit('error', err, response, request, urlSet, options);
          }
          callback(err, response);
          return;
        }

        this.emit('request-success', response, request, urlSet, options);
        callback(null, response);
       }.bind(this));
    }.bind(this);

    request = new AkamaiPurgeRequest(urlSet, options, _callback);
  }.bind(this);

  // and we're off...
  // if the mapper returns any error, all remaining requests are halted
  async.mapSeries(queuedUrls, mapper, function(err, results) {
    process.nextTick(function() {
      if (!err) {
        // emit success event
        this.emit('success', results || []);
      }

      callback(err, results || []);
    }.bind(this));
  }.bind(this));
}

util.inherits(AkamaiPurge, Emitter);

// exports
exports.AkamaiPurge = AkamaiPurge;
exports.AkamaiPurgeRequest = AkamaiPurgeRequest;
exports.AkamaiPurgeRequestBody = AkamaiPurgeRequestBody;
exports.AkamaiPurgeResponse = AkamaiPurgeResponse;
