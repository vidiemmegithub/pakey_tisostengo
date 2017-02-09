'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.utenti-redazionali', {
        url: '/utenti-redazionali',
        templateUrl: 'app/admin/utenti-redazionali/utenti-redazionali.html',
        controller: 'AdminUtentiRedazionaliCtrl',
        controllerAs: 'utenti',
        requiredRole: 'admin'
      });
  });
