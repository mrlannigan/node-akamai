'use strict';

var when = require('when'),
  sinon = require('sinon'),
  should = require('should'),
  utility = require('./../lib/utility');

describe('utility tests', function () {

  describe('#warn()', function () {

    beforeEach(function () {
      this.consoleWrap = new utility.wrappedConsole;
    })

    it ('should prefix console.warn', function () {
      this.consoleWrap.setWarnPrefix('akamai: WARNING:');

      var warnstub = sinon.stub(console, 'warn');

      this.consoleWrap.warn('Test warning');

      sinon.assert.calledWith(warnstub, 'akamai: WARNING: Test warning');
      warnstub.callCount.should.equal(1);
    });

  });

});
