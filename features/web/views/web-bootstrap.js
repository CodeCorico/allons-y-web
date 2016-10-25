(function() {
  'use strict';

  var Ractive = window.Ractive,
      _ractiveControllers = {},
      _fireController = Ractive.fireController,
      _beforeBootstraps = [],
      _bootstraps = [];

  window.require = Ractive.require;

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

  window.beforeBootstrap = function(func) {
    _beforeBootstraps.push(func);
  };

  window.bootstrap = function(func) {
    _bootstraps.push(func);
  };

  window.startBootstrap = function(callback) {
    var $BodyDataService = DependencyInjection.injector.view.get('$BodyDataService'),
        socketUrl = $BodyDataService.data('sockets').url;

    DependencyInjection.service('$socket', [function() {
      return io(socketUrl);
    }]);

    window.async.each(_beforeBootstraps, function(beforeBootstrap, nextBeforeBootstrap) {

      DependencyInjection.injector.view.invoke(null, beforeBootstrap, {
        view: {
          $done: function() {
            return nextBeforeBootstrap;
          }
        }
      });

    }, function() {

      Ractive.Plumes.bootstrap(function($Page) {
        DependencyInjection.view('$Page', [function() {
          return $Page;
        }]);

        DependencyInjection.view('$Layout', [function() {
          return $Page.childrenRequire[0];
        }]);

        var web = $BodyDataService.data('web');

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
  };

})();
