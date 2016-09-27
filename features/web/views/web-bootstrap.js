(function() {
  'use strict';

  var Ractive = window.Ractive,
      require = window.require = Ractive.require,

      _ractiveControllers = {},
      _fireController = Ractive.fireController,
      _bootstraps = [],
      _requiresBefore = [];

  Ractive.DEBUG = /unminified/.test(function() {/*unminified*/});

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

              var Component = component(config);

              Component.on('goto', function(event) {
                var $node = $(event.node),
                    close = $node.attr('data-close');

                if (close) {
                  DependencyInjection.injector.view.get('$Layout').closeOnNotDesktop(close.split(','));
                }

                window.page($node.attr('data-url'));
              });

              return Component;
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

  window.bootstrap = function(requiresBeforeOrFunc, func) {
    if (!func) {
      func = requiresBeforeOrFunc;
      requiresBeforeOrFunc = null;
    }

    if (func) {
      _bootstraps.push(func);
    }
    if (requiresBeforeOrFunc) {
      _requiresBefore.push(requiresBeforeOrFunc);
    }
  };

  window.startBootstrap = function(callback) {
    $.get('/api/sockets-url', function(data) {
      var socketUrl = data && data.url || null;

      DependencyInjection.service('$socket', [function() {
        return io(socketUrl);
      }]);

      window.async.each(_requiresBefore, function(requireBefore, next) {
        require(requireBefore).then(next);
      }, function() {

        Ractive.Plumes.bootstrap(function($Page) {
          DependencyInjection.view('$Page', [function() {
            return $Page;
          }]);

          DependencyInjection.view('$Layout', [function() {
            return $Page.childrenRequire[0];
          }]);

          var web = DependencyInjection.injector.view.get('$BodyDataService').data('web');

          $Page.set('web', web);

          $Page.set('apps', [{
            name: web.brand,
            select: function() { }
          }]);

          $Page.set('onloaded', function() {
            $('.start-mask').remove();
          });

          window.async.each(_bootstraps, function(bootstrap, nextBootstrap) {

            DependencyInjection.injector.view.invoke(null, bootstrap, {
              view: {
                $done: function() {
                  return nextBootstrap;
                }
              }
            });

          }, function() {
            $Page.require().then(function() {
              window.page();

              if (callback) {
                callback();
              }
            });
          });
        });
      });
    });
  };

})();
