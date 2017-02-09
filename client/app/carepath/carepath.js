'use strict';

angular
  .module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('carepath', {
        url: '/percorsiCura/:id',
        templateUrl: 'app/carepath/carepath.html',
        controller: 'CarepathController',
        controllerAs: 'carepath',
        resolve: {
          carepath: function ($stateParams, $state, apiClient) {
            return apiClient.carepaths.get($stateParams.id, {}, [])
              .then(function (res) {
                return res.data;
              }, function () {
                $state.go('percorsiCura');
              });
          }
        }
      });
  });
