'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.utenti-bannati', {
        url: '/utenti-bannati',
        templateUrl: 'app/admin/utenti-bannati/utenti-bannati.html',
        controller: 'AdminUtentiBannatiCtrl',
        controllerAs: 'utenti',
        requiredRole: 'admin'
      });
  });
