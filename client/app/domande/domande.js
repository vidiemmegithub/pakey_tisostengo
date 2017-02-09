'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('domande', {
        url: '/domande',
        templateUrl: 'app/domande/domande.html',
        controller: 'DomandeCtrl',
        controllerAs: 'domande'
      });
  });
