'use strict';

module.exports = [{
  url: '*',
  priority: 'min',

  enter: [
    '$WebService', '$BodyDataService', '$i18nService', '$context', '$Layout',
  function($WebService, $BodyDataService, $i18nService, $context, $Layout) {
    document.title = $i18nService._('Page not found') + ' - ' + $BodyDataService.data('web').brand;

    $context.state.in404 = true;

    $Layout.require('web-404')
      .then(function() {
        $WebService.init();
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
