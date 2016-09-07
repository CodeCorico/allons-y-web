'use strict';

var path = require('path');

require(path.resolve(__dirname, 'models/web-service.js'))();

module.exports = function($done) {
  $done();
};
