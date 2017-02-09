'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('chiSiamo', {
        url: '/chi-siamo',
        templateUrl: 'app/chiSiamo/chi-siamo.html',
        controller: 'ChiSiamoCtrl',
        controllerAs: 'chiSiamo'
      });
  });
