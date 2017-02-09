'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mieDomande', {
        url: '/mie-domande',
        templateUrl: 'app/mieDomande/mie-domande.html',
        controller: 'MieDomandeCtrl',
        controllerAs: 'mieDomande'
      });
  });
