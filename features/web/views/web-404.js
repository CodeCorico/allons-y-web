(function() {
  'use strict';

  window.Ractive.controllerInjection('web-404', [
    '$Page', '$Layout', '$i18nService', '$WebService', '$component', '$data', '$done',
  function web404Controller($Page, $Layout, $i18nService, $WebService, $component, $data, $done) {

    _toggleNowhereTitle(true);

    var Web404Layout = $component({
      data: $data
    });

    $WebService.onSafe('web404Controller.beforeTeardown', function(args, callback) {
      _toggleNowhereTitle(false);

      Web404Layout.set('exit', true);

      setTimeout(callback, 550);
    });

    $WebService.onSafe('web404Controller.teardown', function() {
      Web404Layout.teardown();
      Web404Layout = null;

      setTimeout(function() {
        $WebService.offNamespace('web404Controller');
      });
    });

    function _toggleNowhereTitle(add) {
      var titleComponent = $Layout.findChild('name', 'pl-dropdown-title'),
          titles = titleComponent.get('titles'),
          text = $i18nService._('Nowhere');

      if (add) {
        titles.unshift({
          name: text,
          selected: true,
          select: function() { }
        });
      }
      else {
        titles.shift(0);
      }

      titles.forEach(function(title, i) {
        title.selected = i === 0;
        text = i === 0 ? title.name : text;
      });

      titleComponent.set('titles', titles);

      titleComponent.set('selected.index', 0);
      titleComponent.set('selected.name', text);
    }

    Web404Layout.require().then(function() {
      setTimeout(function() {
        Web404Layout.set('enter', true);
      });

      $done();
    });

  }]);

})();
