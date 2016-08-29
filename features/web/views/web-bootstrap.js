(function() {
  'use strict';

  var Ractive = window.Ractive,
      require = window.require = Ractive.require,

      _ractiveControllers = {},
      _fireController = Ractive.fireController;

  Ractive.controllerInjection = function(name, controller) {
    _ractiveControllers[name] = _ractiveControllers[name] || [];

    if (typeof controller == 'function' || Array.isArray(controller)) {
      _ractiveControllers[name].push(controller);
    }
  };

  function _callControllers(controllers, component, data, el, config, i, done) {
    i = i || 0;

    var $i18nService = DependencyInjection.injector.view.get('$i18nService');

    if (i < controllers.length) {

      DependencyInjection.injector.view.invoke(null, controllers[i], {
        view: {
          $component: function() {
            return function(config) {
              config.data = $.extend(true, {
                componentId: Math.round(Math.random() * 100000000000000000),
                _: $i18nService._
              }, config.data || {});

              return component(config);
            };
          },

          $data: function() {
            return data;
          },

          $el: function() {
            return $(el);
          },

          $config: function() {
            return config;
          },

          $done: function() {
            return function() {
              _callControllers(controllers, component, data, el, config, ++i, done);
            };
          }
        }
      });
    }
    else if (done) {
      done();
    }
  }

  Ractive.fireController = function(name, Component, data, el, config, callback, tries) {
    if (_ractiveControllers[name]) {
      return _callControllers(_ractiveControllers[name], Component, data, el, config, 0, function() {
        _fireController(name, Component, data, el, config, callback, false);
      });
    }

    _fireController(name, Component, data, el, config, callback, tries);
  };

  window.bootstrap = function(func, requiresBefore) {

    DependencyInjection.service('$socket', [function() {
      return io();
    }]);

    window.async.each(requiresBefore || [], function(requireBefore, next) {
      require(requireBefore).then(next);
    }, function() {

      Ractive.Plumes.bootstrap(function($Page) {
        DependencyInjection.view('$Page', [function() {
          return $Page;
        }]);

        DependencyInjection.view('$Layout', [function() {
          return $Page.childrenRequire[0];
        }]);

        DependencyInjection.injector.view.invoke(null, func, {
          view: {
            $done: function() {
              return function done() {
                window.page();
              };
            }
          }
        });
      });
    });
  };

})(this);
