'use strict';

var assert = require('assert'),
  akamai = require('../akamai');

describe('Module API', function () {
  it('akamai.purge should return a function', function () {
    assert.equal(typeof akamai.purge, 'function');
  });

  it('akamai.invalidate should return a function and set the action', function () {
    var testPurge = akamai.invalidate;
    assert.equal(typeof testPurge, 'function');
    assert.deepEqual(testPurge.options, {action: 'invalidate'});
  });

  it('akamai.remove should return a function and set the action', function () {
    var testPurge = akamai.remove;
    assert.equal(typeof testPurge, 'function');
    assert.deepEqual(testPurge.options, {action: 'remove'});
  });

  it('akamai.purge.staging should return a function and set the action', function () {
    var testPurge = akamai.purge.staging;
    assert.equal(typeof testPurge, 'function');
    assert.deepEqual(testPurge.options, {domain: 'staging', action: 'remove'});
  });

  it('akamai.purge.production.cpcode should return a function and set the action', function () {
    var testPurge = akamai.purge.production.cpcode;
    assert.equal(typeof testPurge, 'function');
    assert.deepEqual(testPurge.options, {domain: 'production', action: 'remove', type: 'cpcode'});
  });

  it('akamai.invalidate.production.cpcode should return a function and set the action', function () {
    var testPurge = akamai.invalidate.production.cpcode;
    assert.equal(typeof testPurge, 'function');
    assert.deepEqual(testPurge.options, {domain: 'production', action: 'invalidate', type: 'cpcode'});
  });
});