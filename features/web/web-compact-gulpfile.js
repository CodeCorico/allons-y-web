'use strict';

module.exports = function($allonsy, $gulp) {

  var path = require('path'),
      concat = require('gulp-concat'),
      sourcemaps = require('gulp-sourcemaps'),
      uglify = require('gulp-uglify'),
      rename = require('gulp-rename'),
      fs = require('fs'),
      files = [
        './node_modules/socket.io-client/socket.io.js',
        './node_modules/events-manager/events-manager.js',
        './node_modules/jquery/dist/jquery.js',
        './node_modules/ractive/ractive.js',
        './node_modules/ractive-require/dist/ractive-require.js',
        './node_modules/page/page.js',
        './node_modules/plumes/public/plumes/plumes.js',
        './node_modules/mvw-injection/dist/mvc-injection.js',
        './public/routes/routes.js',
        './public/models/models-abstract-service.js',
        './public/web/web-service.js',
        './public/web/web-favicon-service.js',
        './public/web/web-shortcuts-service.js',
        path.resolve(__dirname, 'views/web-browser.js'),
        path.resolve(__dirname, 'views/web-bootstrap.js'),
        path.resolve(__dirname, 'views/web-extend-page.js'),
        path.resolve(__dirname, 'views/web-index.js')
      ],
      compactFiles = $allonsy.findInFeaturesSync('*-compact.@(js|json)'),
      waitTasks = ['models', 'routes', 'minify'];

  compactFiles.forEach(function(compactFile) {
    var compactFilePath = path.resolve(compactFile),
        compactFilePathDir = path.dirname(compactFile),
        compactModule = require(compactFilePath);

    delete require.cache[compactFilePath];

    if (typeof compactModule == 'function') {
      compactModule = DependencyInjection.injector.controller.invoke(null, compactModule);
    }

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

    compactModule.files.forEach(function(file, i) {
      if (file.indexOf('~') === 0) {
        compactModule.files[i] = path.join(compactFilePathDir, file.substr(1, file.length - 1));
      }
    });

    files = files.concat(compactModule.files);
  });

  files.push('./public/web/web-404-route.js');
  files.push(path.resolve(__dirname, 'views/web-index-start.js'));

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
      .pipe(sourcemaps.init())
      .pipe(uglify().on('error', function(err) {
        $allonsy.logWarning('allons-y-web', 'web:compact-uglify', {
          error: err
        });

        this.emit('end');
      }))
      .pipe(rename({
        extname: '.min.js'
      }))
      .pipe(sourcemaps.write('./'))
      .pipe($gulp.dist('web'))
      .on('end', done);
  });

  // Don't watch /public files because of infinite watcher loop

  return 'web-compact';
};
