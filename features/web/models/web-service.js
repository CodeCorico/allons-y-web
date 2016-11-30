module.exports = function() {
  'use strict';

  DependencyInjection.service('$WebService', ['$AbstractService', function($AbstractService) {

    return new (function $WebService() {

      $AbstractService.call(this);

      var _this = this;

      this.validateEmail = function(email) {
        return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(email);
      };

      this.updateUrl = function(url) {
        _this.fire('updateUrl', {
          url: url
        });
      };

    })();

  }]);

};
