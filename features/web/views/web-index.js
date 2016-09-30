(function() {
  'use strict';

  window.bootstrap(['$ShortcutsService', '$i18nService', '$done', function($ShortcutsService, $i18nService, $done) {
    var _fullscreenOpened = [false, false];

    $ShortcutsService.register(
      null,
      'web-f10',
      'F10',
      $i18nService._('Close the context panels'),
      function(e) {
        // F10
        var isShortcut = e.keyCode == 121 && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey;

        if (isShortcut) {
          e.preventDefault();
          e.stopPropagation();
        }

        return isShortcut;
      },
      function() {
        var $Layout = DependencyInjection.injector.view.get('$Layout'),
            fullscreenOpened = [$Layout.leftContext().get('opened'), $Layout.rightContext().get('opened')];

        if (!fullscreenOpened[0] && !fullscreenOpened[1]) {
          if (_fullscreenOpened[0]) {
            $Layout.leftContext().open(null, false);
          }
          if (_fullscreenOpened[1]) {
            $Layout.rightContext().open(null, false);
          }

          _fullscreenOpened = [false, false];
        }
        else {
          _fullscreenOpened = fullscreenOpened;

          $Layout.leftContext().close(null, false);
          $Layout.rightContext().close(null, false);
        }
      }
    );

    $done();
  }]);

})();
