'use strict';

angular
  .module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.specializations', {
        url: '/specializzazioni',
        templateUrl: 'app/admin/specializations/specializations.html',
        controller: 'AdminSpecializationsController',
        controllerAs: 'adminSpecializations',
        requiredRole: 'admin'
      });
  });
