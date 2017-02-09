'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.utenti-qualificati', {
        url: '/utenti-qualificati',
        templateUrl: 'app/admin/utenti-qualificati/utenti-qualificati.html',
        controller: 'AdminUtentiQualificatiCtrl',
        controllerAs: 'utenti',
        requiredRole: 'admin'
      });
  });
