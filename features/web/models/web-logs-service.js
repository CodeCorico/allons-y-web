module.exports = function() {
  'use strict';

  DependencyInjection.service('$LogsService', ['$socket', function($socket) {

    return new (function $LogsService() {

      var _this = this;

      this.LOG_TYPE = {
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error'
      };

      this.log = function(namespace, log, args, type) {
        $socket.emit('create(web/log)', {
          namespace: namespace,
          log: log,
          args: args,
          type: type || _this.LOG_TYPE.INFO
        });
      };

      this.logWarning = function(namespace, log, args) {
        _this.log(namespace, log, args, _this.LOG_TYPE.WARNING);
      };

      this.logError = function(namespace, log, args) {
        _this.log(namespace, log, args, _this.LOG_TYPE.ERROR);
      };

    })();

  }]);

};
