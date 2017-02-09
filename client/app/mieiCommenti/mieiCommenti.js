'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mieiCommenti', {
        url: '/miei-commenti',
        templateUrl: 'app/mieiCommenti/miei-commenti.html',
        controller: 'MieiCommentiCtrl',
        controllerAs: 'mieiCommenti'
      });
  });
