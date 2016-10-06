(function() {
  'use strict';

  window.bootstrap(['$Page', '$done', function($Page, $done) {

    var _remembers = [],
        _lastRememberedUrl = null,
        _hasContextsEvents = false;

    function _uiCookie(newCookieData) {
      if (newCookieData) {
        window.Cookies.set('web.ui', newCookieData, {
          expires: 365,
          path: '/'
        });
      }

      return window.Cookies.getJSON('web.ui') || {};
    }

    function _locationRemembered() {
      for (var i = 0; i < _remembers.length; i++) {
        if (window.location.pathname.match(_remembers[i])) {
          return _remembers[i].toString();
        }
      }

      return null;
    }

    function _rememberedFromContext(context, orientation, args) {
      if (!args.userBehavior) {
        return null;
      }

      var url = _locationRemembered();

      if (url === null) {
        url;
      }

      var $context = $(context.el),
          $group = $context.find('.pl-group.opened'),
          groupName = $group.attr('data-group') || false;

      if (!groupName) {
        return null;
      }

      var buttons = $Page.get('buttons' + orientation) || [];

      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].group == groupName) {
          return {
            url: url,
            button: buttons[i]
          };
        }
      }
    }

    function _contextsEvents() {
      if (_hasContextsEvents) {
        return;
      }

      var $Layout = DependencyInjection.injector.view.get('$Layout');

      if (!$Layout.leftContext() || !$Layout.rightContext()) {
        return setTimeout(_contextsEvents, 10);
      }

      _hasContextsEvents = true;

      ['left', 'right'].forEach(function(orientation) {
        var context = $Layout[orientation + 'Context']();

        context.on('open', function(args) {
          var rememberObj = _rememberedFromContext(context, orientation, args);

          if (!rememberObj || !rememberObj.button || !rememberObj.button.autoOpen) {
            return;
          }

          var uiCookie = _uiCookie(),
              url = rememberObj.url,
              button = rememberObj.button;

          uiCookie[url] = uiCookie[url] || {};
          uiCookie[url][orientation] = button.pageButtonName;

          _uiCookie(uiCookie);
        });

        context.on('beforeCloseContent', function(args) {
          var rememberObj = _rememberedFromContext(context, orientation, args);

          if (!rememberObj || !rememberObj.button) {
            return;
          }

          var uiCookie = _uiCookie(),
              url = rememberObj.url,
              button = rememberObj.button;

          uiCookie[url] = uiCookie[url] || {};

          if (button.autoOpen) {
            uiCookie[url][orientation] = null;
          }
          else {
            delete uiCookie[url][orientation];

            if (
              typeof uiCookie[url].left == 'undefined' &&
              typeof uiCookie[url].right == 'undefined'
            ) {
              delete uiCookie[url];
            }
          }

          _uiCookie(uiCookie);
        });
      });
    }

    $Page.remember = function(urls) {
      urls = urls instanceof RegExp ? [urls] : urls;

      _remembers = _remembers.concat(urls);

      return $Page;
    };

    $Page.refreshRemember = function() {
      var url = _locationRemembered();

      if (!url || url == _lastRememberedUrl) {
        return $Page;
      }

      _lastRememberedUrl = url;

      var uiCookie = _uiCookie();
      if (!uiCookie[url]) {
        return $Page;
      }

      var $Layout = DependencyInjection.injector.view.get('$Layout');

      ['left', 'right'].forEach(function(orientation) {
        if (typeof uiCookie[url][orientation] == 'undefined') {
          return $Page;
        }

        if (uiCookie[url][orientation] === null) {
          $Layout[orientation + 'Context']().close();

          return $Page;
        }

        var buttons = $Page.get('buttons' + orientation) || [];

        for (var i = 0; i < buttons.length; i++) {
          if (buttons[i].pageButtonName == uiCookie[url][orientation]) {
            if (!buttons[i].group || !buttons[i].isReady) {
              return $Page;
            }

            var GroupedButtons = $Layout.findChild('data-pl-name', 'buttons-' + orientation),
                buttonsComponents = GroupedButtons.get('buttons');

            for (var j = 0; j < buttonsComponents.length; j++) {
              if (buttonsComponents[j].pageButtonName == buttons[i].pageButtonName) {
                var buttonComponent = GroupedButtons.findChild('data-index', j);

                if (!$Layout[orientation + 'Context']().isGroupOpened(buttons[i].group)) {
                  buttonComponent.action(false);
                }

                return;
              }
            }

            return;
          }
        }
      });

      return $Page;
    };

    ['left', 'right'].forEach(function(orientation) {
      $Page[orientation + 'ButtonAdd'] = function(name, button, after) {
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

        if (button.autoOpen && button.group) {
          var ready = button.ready || function() { };

          button.ready = function(buttonComponent) {
            var $Layout = DependencyInjection.injector.view.get('$Layout');

            _contextsEvents();

            if ($Layout.get('screen') != 'screen-desktop') {
              return ready.apply(buttonComponent, arguments);
            }

            if (button.autoOpen == 'always') {
              buttonComponent.action(false);

              return ready.apply(buttonComponent, arguments);
            }

            var uiCookie = _uiCookie(),
                uiCookieUrls = Object.keys(uiCookie);

            for (var i = 0; i < uiCookieUrls.length; i++) {
              var url = uiCookieUrls[i];

              if (typeof uiCookie[url][orientation] == 'undefined') {
                continue;
              }

              var flags = url.replace(/.*\/([gimy]*)$/, '$1'),
                  pattern = url.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1'),
                  regex = new RegExp(pattern, flags);

              if (window.location.pathname.match(regex)) {
                if (uiCookie[url][orientation] == button.pageButtonName) {
                  buttonComponent.action(false);
                }

                return ready.apply(buttonComponent, arguments);
              }
            }

            if (button.autoOpen instanceof RegExp && !window.location.pathname.match(button.autoOpen)) {
              return ready.apply(buttonComponent, arguments);
            }

            var activate = true;

            for (var i = 0; i < buttons.length; i++) {
              if (buttons[i] == button) {
                continue;
              }

              if (
                buttons[i].autoOpen == 'always' ||
                (buttons[i].autoOpen == 'main' && button.autoOpen != 'main') ||
                (window.location.pathname.match(buttons[i].autoOpen) && button.autoOpen === true)
              ) {
                activate = false;

                break;
              }
            }

            if (activate) {
              buttonComponent.action(false);
            }

            ready.apply(buttonComponent, arguments);
          };

        }

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

    $done();
  }]);

})();
