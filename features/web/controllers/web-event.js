'use strict';

module.exports = [{

  event: 'update(web/route)',
  controller: function($allonsy, $socket, $message) {
    if (!this.validMessage($message, {
      path: ['string']
    })) {
      return;
    }

    var isMobile = $message.screenWidth < 450 || $message.screenHeight < 450;

    $allonsy.log('allons-y-web', 'route:' + $message.path, {
      metric: $message.init ? {
        key: isMobile ? 'webStartMobile' : 'webStart',
        name: isMobile ? 'Start (mobile)' : 'Start (desktop & tablet)',
        description: isMobile ?
          'Start the platform on a mobile device.' :
          'Start the platform on a desktop or tablet device.'
      } : null,
      socket: $socket,
      init: !!$message.init,
      hash: typeof $message.hash == 'string' && $message.hash || null,
      params: typeof $message.params == 'string' && $message.params || null,
      url: $message.path,
      screen: {
        width: $message.screenWidth || null,
        height: $message.screenHeight || null
      }
    });
  }
}];
