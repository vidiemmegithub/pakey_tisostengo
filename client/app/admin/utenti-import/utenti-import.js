'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.utenti-import', {
        url: '/utenti-import',
        templateUrl: 'app/admin/utenti-import/utenti-import.html',
        controller: 'AdminUtentiImportCtrl',
        controllerAs: 'utenti',
        requiredRole: 'admin'
      });
  });
