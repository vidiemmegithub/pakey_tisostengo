'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.spalle-redazionali', {
        url: '/spalle-redazionali',
        templateUrl: 'app/admin/spalle-redazionali/spalle-redazionali.html',
        controller: 'AdminSpalleRedazionaliCtrl',
        controllerAs: 'spalla',
        requiredRole: 'admin'
      });
  });
