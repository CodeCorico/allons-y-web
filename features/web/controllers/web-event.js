'use strict';

module.exports = [{

  event: 'update(web/route)',
  controller: function($allonsy, $socket, $message) {
    if (!this.validMessage($message, {
      path: ['string']
    })) {
      return;
    }

    $allonsy.log('allons-y-web', 'route:' + $message.path, {
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

    // if ($message.init) {
    //   WinChartModel.updateChart('updateFeatureCount', {
    //     feature: $message.screenWidth < 450 || $message.screenHeight < 450 ? 'startMobile' : 'start'
    //   });
    // }
  }
}];
