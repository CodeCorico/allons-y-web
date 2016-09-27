'use strict';

module.exports = [{
  url: '*',
  priority: 'min',

  enter: [
    '$WebService', '$Page', '$i18nService', '$context', '$Layout',
  function($WebService, $Page, $i18nService, $context, $Layout) {
    document.title = $i18nService._('Page not found') + ' - ' + $Page.get('web').brand;

    $context.state.in404 = true;

    setTimeout(function() {
      $Layout.require('web-404')
        .then(function() {
          $WebService.init();
        });
    });
  }],

  exit: ['$context', '$next', function($context, $next) {
    if ($context.state && $context.state.in404) {
      $context.state.in404 = false;

      return DependencyInjection.injector.view.get('$WebService').teardown(null, $next);
    }

    $next();
  }]
}];
