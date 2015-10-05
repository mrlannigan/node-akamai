'use strict';

// Export version
exports.VERSION = require('./package.json').version;

// Export the purge API
exports.purge = require('./lib/purge').AkamaiPurge;

// Prepare and export the purge API with the invalidation option already preset
Object.defineProperty(exports, 'invalidate', {
  enumerable: true,
  get: function () {
    return exports.purge.invalidate;
  }
});

// Prepare and export the purge API with the remove option explicitly already preset
Object.defineProperty(exports, 'remove', {
  enumerable: true,
  get: function () {
    return exports.purge.remove;
  }
});

// Export the queue request
exports.queue = require('./lib/queue').AkamaiQueueLength;

// Export the status request
exports.status = require('./lib/status').AkamaiStatus;
