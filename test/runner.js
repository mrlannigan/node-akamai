require('blanket')({
  "pattern": new RegExp(process.cwd() + '/(lib|akamai\.js)(/.*\.js)?$')
});

require('./api_test');
require('./purge_test');
require('./status_test');
require('./request_test');
require('./queue_test');
require('./utility_test')