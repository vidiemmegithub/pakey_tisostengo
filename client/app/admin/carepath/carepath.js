'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.newCarepath', {
        url: '/percorsi-cura/crea',
        templateUrl: 'app/admin/carepath/carepath.html',
        controller: 'AdminCarepathCtrl',
        controllerAs: 'adminCarepath',
        requiredRole: 'admin',
        resolve: {
          carepath: function ($stateParams, $state, apiClient) {
            return {
              steps: []
            };
          }
        }
      })
      .state('admin.editCarepath', {
        url: '/percorsi-cura/:id/modifica',
        templateUrl: 'app/admin/carepath/carepath.html',
        controller: 'AdminCarepathCtrl',
        controllerAs: 'adminCarepath',
        requiredRole: 'admin',
        resolve: {
          carepath: function ($stateParams, $state, apiClient) {
            return apiClient.carepaths.get($stateParams.id, {}, [])
              .then(function (res) {
                return res.data;
              }, function () {
                $state.go('admin.carepaths');
              });
          }
        }
      });
  });
