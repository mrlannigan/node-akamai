'use strict';

var akamia = require('../akamai.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['purge'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'default': function(test) {
    test.expect(2);
    // tests here

    test.doesNotThrow(function(){
        var a = new akamia.purge();
    });

    test.throws(function(){
        var a = akamia.purge();
    });
    test.done();
  }
};
