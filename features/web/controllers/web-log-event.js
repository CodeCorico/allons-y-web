'use strict';

module.exports = [{
  event: 'create(web/log)',
  controller: function($allonsy, $message) {
    if (!this.validMessage($message, {
      namespace: ['string', 'filled'],
      log: ['string', 'filled'],
      type: ['string', 'filled']
    })) {
      return;
    }

    $message.args = typeof $message.args == 'object' ? $message.args : null;

    $allonsy.log($message.namespace, $message.log, $message.args, $message.type);
  }
}];
