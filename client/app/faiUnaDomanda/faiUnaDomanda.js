'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('faiUnaDomanda', {
        url: '/professionista/:id/fai-una-domanda',
        templateUrl: 'app/faiUnaDomanda/fai-una-domanda.html',
        controller: 'FaiUnaDomandaCtrl',
        controllerAs: 'faiUnaDomanda'
      });
  });
