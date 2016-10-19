'use strict';

module.exports = function() {
  if (process.env.PLUMES && process.env.PLUMES == 'false') {
    return null;
  }

  var path = require('path');

  return {
    lessPaths: [
      path.resolve('./'),
      path.resolve(__dirname, 'views/less')
    ]
  };
};
