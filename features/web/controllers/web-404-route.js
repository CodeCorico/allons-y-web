'use strict';

module.exports = [{
  url: '*',
  priority: 'min',

  enter: [
    '$BodyDataService', '$WebService', '$Page', '$i18nService', '$context', '$Layout',
  function($BodyDataService, $WebService, $Page, $i18nService, $context, $Layout) {
    var prerender = $BodyDataService.data('prerender');

    document.title = $i18nService._('Page not found') + ' - ' + $Page.get('web').brand;

    $context.state.in404 = true;

    if (prerender) {
      var meta = document.createElement('meta');

      meta.name = 'prerender-status-code';
      meta.content = '404';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    setTimeout(function() {
      $Layout.require('web-404')
        .then(function() {
          $WebService.init();
        });
    });
  }],

  exit: ['$BodyDataService', '$context', '$next', function($BodyDataService, $context, $next) {
    if ($context.state && $context.state.in404) {
      var prerender = $BodyDataService.data('prerender');

      if (prerender) {
        $('meta[name="prerender-status-code"]').remove();
      }

      $context.state.in404 = false;

      return DependencyInjection.injector.view.get('$WebService').teardown(null, $next);
    }

    $next();
  }]
}];
