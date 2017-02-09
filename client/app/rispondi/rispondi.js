'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('rispondi', {
        url: '/rispondi/:id',
        templateUrl: 'app/rispondi/rispondi.html',
        controller: 'RispondiCtrl',
        controllerAs: 'rispondi'
      });
  });
