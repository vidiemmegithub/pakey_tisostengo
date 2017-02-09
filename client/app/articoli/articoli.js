'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('articoli', {
        url: '/articoli',
        templateUrl: 'app/articoli/articoli.html',
        controller: 'ArticoliCtrl',
        controllerAs: 'articoli'
      });
  });
