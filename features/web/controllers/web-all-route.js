'use strict';

module.exports = {
  url: '*',
  priority: 'max',

  enter: [
    '$RealTimeService', '$Page', '$socket', '$context', '$next',
  function($RealTimeService, $Page, $socket, $context, $next) {

    $RealTimeService.url(document.location.pathname);

    $Page.refreshRemember();

    var _$el = {
      window: $(window)
    };

    function _update() {
      $socket.emit('update(web/route)', {
        init: $context.init || false,
        path: $context.path,
        hash: $context.hash,
        params: $context.params,
        screenWidth: _$el.window.width(),
        screenHeight: _$el.window.height()
      });
    }

    if (!$socket.disconnected) {
      _update();
    }

    $next();
  }]
};
