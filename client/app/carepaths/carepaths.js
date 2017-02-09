'use strict';

angular
  .module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('carepaths', {
        url: '/percorsiCura',
        templateUrl: 'app/carepaths/carepaths.html',
        controller: 'CarepathsController',
        controllerAs: 'carepaths'
      });
  });
