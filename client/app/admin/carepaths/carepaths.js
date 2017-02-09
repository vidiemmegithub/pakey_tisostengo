'use strict';

angular
  .module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.carepaths', {
        url: '/percorsi-cura',
        templateUrl: 'app/admin/carepaths/carepaths.html',
        controller: 'AdminCarepathsController',
        controllerAs: 'adminCarepaths',
        requiredRole: 'admin'
      });
  });
