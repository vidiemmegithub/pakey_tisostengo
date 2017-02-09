'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.utenti-premium', {
        url: '/utenti-premium',
        templateUrl: 'app/admin/utenti-premium/utenti-premium.html',
        controller: 'AdminUtentiPremiumCtrl',
        controllerAs: 'utenti',
        requiredRole: 'admin'
      });
  });
