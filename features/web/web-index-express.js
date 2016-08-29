'use strict';

module.exports = function($allonsy, $server) {
  $allonsy.requireInFeatures('bodydata-service');

  var path = require('path'),
      fs = require('fs'),
      indexFile = path.resolve('public/web/web-index.html'),
      $BodyDataService = DependencyInjection.injector.controller.get('$BodyDataService');

  $BodyDataService.data('web', {
    brand: process.env.WEB_BRAND || ''
  });

  $server.use(function(req, res) {
    res.send($BodyDataService.inject(fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf-8') : ''));
  });
};
