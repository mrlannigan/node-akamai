'use strict';

exports.wrappedConsole = WrappedConsole;

function WrappedConsole () {
  this.warnPrefix = '';
}

WrappedConsole.prototype.setWarnPrefix = function (prefix) {
  this.warnPrefix = prefix ? prefix.trim() + ' ' : '';
};

WrappedConsole.prototype.warn = function (message) {
  console.warn(this.warnPrefix + message);
};
