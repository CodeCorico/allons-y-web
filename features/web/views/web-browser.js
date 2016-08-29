(function() {
  'use strict';

  navigator.browser = (function() {
    var ua = navigator.userAgent,
        tem = null,
        mathing = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    if (/trident/i.test(mathing[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];

      return {
        name: 'IE',
        version: tem[1] || ''
      };
    }

    if (mathing[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem !== null) {
        return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }
    }

    mathing = mathing[2] ? [mathing[1], mathing[2]] : [navigator.appName, navigator.appVersion, '-?'];

    if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
      mathing.splice(1, 1, tem[1]);
    }

    return {
      name: mathing.shift(),
      version: mathing.join(' ')
    };
  })();

})(this);
