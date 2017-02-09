'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('terminiCondizioni', {
        url: '/termini-condizioni',
        templateUrl: 'app/terminiCondizioni/termini-condizioni.html',
        controller: 'TerminiCondizioniCtrl'
      });
  });
