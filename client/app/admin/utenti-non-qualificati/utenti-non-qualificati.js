'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.utenti-non-qualificati', {
        url: '/utenti-non-qualificati',
        templateUrl: 'app/admin/utenti-non-qualificati/utenti-non-qualificati.html',
        controller: 'AdminUtentiNonQualificatiCtrl',
        controllerAs: 'utenti',
        requiredRole: 'admin'
      });
  });
