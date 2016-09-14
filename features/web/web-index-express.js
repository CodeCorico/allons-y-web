'use strict';

module.exports = function($allonsy, $server, $BodyDataService) {
  var path = require('path'),
      fs = require('fs'),
      indexFile = path.resolve('public/web/web-index.html'),
      web = $BodyDataService.data('web') || {};

  web.brand = web.brand || process.env.WEB_BRAND || '';

  $BodyDataService.data('web', web);

  $server.use(function(req, res) {
    res.send($BodyDataService.inject(fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf-8') : ''));
  });
};
