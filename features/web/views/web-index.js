(function() {
  'use strict';

  window.bootstrap(['$ShortcutsService', '$i18nService', '$done', function($ShortcutsService, $i18nService, $done) {
    var _fullscreenOpened = {
      left: false,
      right: false
    };

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
            fullscreenOpened = {
              left: false,
              right: false
            },
            contexts = {},
            $contexts = {};

        ['left', 'right'].forEach(function(direction) {
          contexts[direction] = $Layout[direction + 'Context']();
          $contexts[direction] = $(contexts[direction].el);

          if (contexts[direction].get('opened')) {
            fullscreenOpened[direction] = $contexts[direction].find('.pl-group.opened').attr('data-group') || false;
          }
        });

        if (!fullscreenOpened.left && !fullscreenOpened.right) {
          ['left', 'right'].forEach(function(direction) {
            if (_fullscreenOpened[direction]) {
              $contexts[direction].find('[data-group="' + _fullscreenOpened[direction] + '"]').addClass('opened');

              $Layout[direction + 'Context']().open(null, false, _fullscreenOpened[direction]);
            }
          });

          _fullscreenOpened = {
            left: false,
            right: false
          };
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
