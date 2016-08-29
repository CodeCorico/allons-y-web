module.exports = function() {
  'use strict';

  DependencyInjection.service('WebService', ['$AbstractService', function($AbstractService) {

    return new (function WebService() {

      $AbstractService.call(this);

    })();

  }]);

};
