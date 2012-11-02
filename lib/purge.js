/*jshint node: true, eqnull: true*/

'use strict';

// Dependencies
var util = require('util'),
  Emitter = require('events').EventEmitter,
  _ = require('underscore'),
  xml2js = require('xml2js');

// Constants
var VALID_TYPES = ['arl', 'cpcode'],
  VALID_ACTIONS = ['remove', 'invaidate'],
  VALID_DOMAINS = ['production', 'staging'],
  AKAMAI_API_PURGE = 'https://ccuapi.akamai.com:443/soap/servlet/soap/purge',
  AKAMAI_SOAP_ACTION = 'http://ccuapi.akamai.com/purge#purgeRequest',
  AKAMAI_URIS_PER_REQUEST = 100;

// Class
function AkamaiPurgeRequest(urls, options, callback) {
  var requestBody;

  if (!_.isArray(urls) && _.isObject(urls)) {
    options = _.clone(urls);
    if (options.urls) { urls = options.urls; }
  }

  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  if (false === options instanceof Object) { options = {}; }

  if (false === callback instanceof Function) {
    if (options.callback) {
      callback = options.callback;
    } else if (options.complete) {
      callback = options.complete;
    } else {
      callback = function() {};
    }
  }

  options = _.extend({
    type: 'arl',
    domain: 'production',
    action: 'remove'
  }, options);

  requestBody = AkamaiPurgeRequestBody(urls, options);

  callback(requestBody);
}

util.inherits(AkamaiPurgeRequest, Emitter);


function AkamaiPurgeRequestBody(urls, options) {
  var bodyURIs = '',
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
      '</soap:body>',
    '</soap:Envelope>'
  ].join('');

  return requestBody;
}

function AkamaiPurgeResponse(rawBody, callback) {
  var body, keys;

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
    if (callback) callback(err, this);
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
        return _callback(new Error(body['SOAP-ENV:Fault'][0].faultstring[0]));
      } catch (e) {
        return _callback(new Error('Invalid server purge fault response'));
      }
    }

    if (body['ns0:purgeRequestResponse']) {
      try {
        var purgeResult = body['ns0:purgeRequestResponse'][0].return[0];
        Object.keys(purgeResult).forEach(function(key) {
          if (!purgeResult[key][0] || !purgeResult[key][0]['_']) return;
          this[key] = purgeResult[key][0]['_'];
          this._keys.push(key);
        }.bind(this));

        return _callback(null);
      } catch (e) {
       return _callback(new Error('Invalid server purge response'));
      }
    }

    return _callback(new Error('Unknown server response'));
  }.bind(this));

  return result;
}

AkamaiPurgeResponse.prototype.hasError = function() {
  return !!this.error;
}

AkamaiPurgeResponse.prototype.getError = function() {
  return this.error;
}

AkamaiPurgeResponse.prototype.reset = function() {
  (this._keys || []).forEach(function(key) {
    delete this._keys[key];
  });
  this._keys = [];
}

AkamaiPurgeResponse.prototype.setBody = function(rawBody) {
  this._body = rawBody || '';
  return this;
}


exports.AkamaiPurgeRequest = AkamaiPurgeRequest;
exports.AkamaiPurgeRequestBody = AkamaiPurgeRequestBody;
exports.AkamaiPurgeResponse = AkamaiPurgeResponse;