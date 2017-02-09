'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('professionisti', {
        url: '/professionisti',
        templateUrl: 'app/professionisti/professionisti.html',
        controller: 'ProfessionistiCtrl',
        controllerAs: 'professionisti'
      });
  });
