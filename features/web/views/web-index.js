(function() {
  'use strict';

  window.bootstrap(['$Page', '$BodyDataService', '$done', function($Page, $BodyDataService, $done) {
    var web = $BodyDataService.data('web');

    $Page.set('web', web);

    $Page.set('apps', [{
      name: web.brand,
      select: function() { }
    }]);

    $Page.set('onloaded', function() {
      $('.start-mask').remove();
    });

    $Page.require().then($done);
  }]);

})();
