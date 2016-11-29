'use strict';

module.exports = function($allonsy, $server, $BodyDataService) {
  var path = require('path'),
      fs = require('fs'),
      indexFile = path.resolve('public/web/web-index.html'),
      web = $BodyDataService.data(null, 'web') || {};

  web.brand = web.brand || process.env.WEB_BRAND || '';

  $BodyDataService.data(null, 'web', web);

  $server.use(function(req, res) {
    var userAgent = req.headers['user-agent'] || '';

    if (userAgent.match(/prerender/i)) {
      $BodyDataService.data(req, 'prerender', true);
    }

    res.send($BodyDataService.inject(req, fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf-8') : ''));
  });
};
