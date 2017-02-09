'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('contatta', {
        url: '/contatta?type&id',
        templateUrl: 'app/contatta/contatta.html',
        controller: 'ContattaCtrl',
        controllerAs: 'contatta'
      });
  });
