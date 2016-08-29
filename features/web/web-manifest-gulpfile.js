'use strict';

module.exports = function($allonsy, $gulp) {

  var fs = require('fs-extra'),
      path = require('path'),
      jsonfile = require('jsonfile'),
      manifestFile = path.join(__dirname, 'views/web-manifest.json'),
      manifestDestinationPath = path.join('public/web'),
      manifestDestination = path.join(manifestDestinationPath, 'manifest.json'),
      manifest = fs.readFileSync(manifestFile, 'utf-8');

  manifest = manifest.replace(/{{BRAND}}/g, process.env.WEB_BRAND && process.env.WEB_BRAND || '');

  $gulp.task('manifest', function(done) {
    var manifestJSON = JSON.parse(manifest),
        webManifestFiles = $allonsy.findInFeaturesSync('*-web-manifest.js');

    webManifestFiles.forEach(function(webManifestFile) {
      var manifestModule = require(path.resolve(webManifestFile));

      DependencyInjection.injector.controller.invoke(null, manifestModule, {
        controller: {
          $manifest: function() {
            return manifestJSON;
          }
        }
      });
    });

    fs.ensureDirSync(manifestDestinationPath);

    jsonfile.spaces = 2;
    jsonfile.writeFileSync(manifestDestination, manifestJSON, {
      spaces: 2
    });

    done();
  });

  return 'manifest';
};
