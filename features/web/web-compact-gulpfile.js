'use strict';

module.exports = function($allonsy, $gulp) {

  var path = require('path'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglifyjs'),
      fs = require('fs'),
      files = [
        'node_modules/socket.io-client/socket.io.js',
        'node_modules/events-manager/events-manager.js',
        'node_modules/jquery/dist/jquery.js',
        'node_modules/ractive/ractive.js',
        'node_modules/ractive-require/dist/ractive-require.js',
        'node_modules/page/page.js',
        'node_modules/plumes/public/plumes/plumes.js',
        'node_modules/mvw-injection/dist/mvc-injection.js',
        'public/routes/routes.js',
        'public/models/models-abstract-service.js',
        'public/web/web-service.js',
        'public/web/web-favicon-service.js',
        'public/web/web-shortcuts-service.js',
        'node_modules/allons-y-web/features/web/views/web-browser.js',
        'node_modules/allons-y-web/features/web/views/web-bootstrap.js',
        'node_modules/allons-y-web/features/web/views/web-index.js'
      ],
      compactFiles = $allonsy.findInFeaturesSync('*-compact.json'),
      waitTasks = ['models', 'routes'];

  compactFiles.forEach(function(compactFile) {
    var compactModule = require(path.resolve(compactFile));

    if (compactModule && compactModule.waitTasks) {
      compactModule.waitTasks.forEach(function(waitTask) {
        if (waitTasks.indexOf(waitTask) < 0) {
          waitTasks.push(waitTask);
        }
      });
    }

    if (!compactModule || !compactModule.files) {
      return;
    }

    files = files.concat(compactModule.files);
  });

  files.push('public/web/web-404-route.js');
  files.push('node_modules/allons-y-web/features/web/views/web-index-start.js');

  files.forEach(function(file, i) {
    files[i] = path.resolve(file);
  });

  $gulp.task('web-compact', waitTasks, function(done) {
    for (var i = 0; i < files.length; i++) {
      if (Array.isArray(files[i])) {
        for (var j = 0; j < files[i].length; j++) {
          if (fs.existsSync(files[i][j])) {
            files[i] = files[i][j];

            break;
          }
        }

        if (Array.isArray(files[i])) {
          throw new Error('File doesn\'t exists: ', files[i]);
        }
      }
    }

    $gulp
      .src(files)
      .pipe(concat('web-compact.js', {
        newLine: '\r\n'
      }))
      .pipe($gulp.dist('web'))
      .pipe(uglify('web-compact.min.js', {
        outSourceMap: true
      }))
      .pipe($gulp.dist('web'))
      .on('end', done);
  });

  return {
    tasks: 'web-compact',
    watch: files
  };
};
