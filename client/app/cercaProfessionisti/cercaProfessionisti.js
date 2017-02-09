'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('cercaProfessionisti', {
        url: '/cerca-professionisti/:id',
        templateUrl: 'app/cercaProfessionisti/cerca-professionisti.html',
        controller: 'CercaProfessionistiCtrl',
        controllerAs: 'cercaProfessionisti'
      });
  });
