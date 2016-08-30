(function() {
  'use strict';

  window.bootstrap(['$Page', '$done', function($Page, $done) {

    ['left', 'right'].forEach(function(orientation, after) {
      $Page[orientation + 'ButtonAdd'] = function(name, button) {
        if (!name || !button) {
          return;
        }

        var buttons = $Page.get('buttons' + orientation),
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

        var buttons = $Page.get('buttons' + orientation);

        for (var i = 0; i < buttons.length; i++) {
          if (buttons[i].pageButtonName == name) {
            buttons.splice(i, 1);

            $Page.set('buttons' + orientation, buttons);

            break;
          }
        }
      };
    });

    $done();
  }]);

  window.startBootstrap();
})();
