'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('cookie', {
        url: '/cookie',
        templateUrl: 'app/cookie/cookie.html',
        controller: 'CookieCtrl'
      });
  });
