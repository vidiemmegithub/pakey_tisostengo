'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.home-redazionale', {
        url: '/home-redazionale',
        templateUrl: 'app/admin/home-redazionale/home-redazionale.html',
        controller: 'AdminHomeRedazionaleCtrl',
        controllerAs: 'home',
        requiredRole: 'admin'
      });
  });
