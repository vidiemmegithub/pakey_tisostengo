'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('cercaContenuti', {
        url: '/cerca-contenuti/:id',
        templateUrl: 'app/cercaContenuti/cerca-contenuti.html',
        controller: 'CercaContenutiCtrl',
        controllerAs: 'cercaContenuti'
      });
  });
