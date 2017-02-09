'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('domandeInArrivo', {
        url: '/domande-in-arrivo',
        templateUrl: 'app/domandeInArrivo/domande-in-arrivo.html',
        controller: 'DomandeInArrivoCtrl',
        controllerAs: 'domandeInArrivo'
      });
  });
