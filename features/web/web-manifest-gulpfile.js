'use strict';

module.exports = function($gulp) {

  var fs = require('fs-extra'),
      path = require('path'),
      manifestFile = path.join(__dirname, 'views/manifest.json'),
      manifestDestinationPath = path.join('public/web'),
      manifestDestination = path.join(manifestDestinationPath, 'manifest.json');

  $gulp.task('manifest', function(done) {
    var manifest = fs.readFileSync(manifestFile, 'utf-8');

    manifest = manifest.replace(/{{BRAND}}/g, process.env.WEB_BRAND && process.env.WEB_BRAND || '');

    fs.ensureDirSync(manifestDestinationPath);
    fs.writeFileSync(manifestDestination, manifest);

    done();
  });

  return 'manifest';
};
