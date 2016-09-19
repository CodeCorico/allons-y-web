(function() {
  'use strict';

  window.bootstrap([
    '$Page', '$ShortcutsService', '$i18nService', '$done',
  function($Page, $ShortcutsService, $i18nService, $done) {

    var _fullscreenOpened = [false, false];

    ['left', 'right'].forEach(function(orientation, after) {
      $Page[orientation + 'ButtonAdd'] = function(name, button) {
        if (!name || !button) {
          return;
        }

        var buttons = $Page.get('buttons' + orientation) || [],
            alreadyAdded = false;

        for (var i = 0; i < buttons.length; i++) {
          if (buttons[i].pageButtonName == name) {
            alreadyAdded = true;

            break;
          }
        }

        if (alreadyAdded) {
          return;
        }

        button.pageButtonName = name;

        buttons[after ? 'push' : 'unshift'](button);

        $Page.set('buttons' + orientation, buttons);
      };

      $Page[orientation + 'ButtonRemove'] = function(name) {
        if (!name) {
          return;
        }

        var buttons = $Page.get('buttons' + orientation) || [];

        for (var i = 0; i < buttons.length; i++) {
          if (buttons[i].pageButtonName == name) {
            buttons.splice(i, 1);

            $Page.set('buttons' + orientation, buttons);

            break;
          }
        }
      };
    });

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
