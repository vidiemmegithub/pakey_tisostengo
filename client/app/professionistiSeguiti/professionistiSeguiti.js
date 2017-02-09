'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('professionistiSeguiti', {
        url: '/professionisti-seguiti',
        templateUrl: 'app/professionistiSeguiti/professionisti-seguiti.html',
        controller: 'ProfessionistiSeguitiCtrl',
        controllerAs: 'professionistiSeguiti'
      });
  });
