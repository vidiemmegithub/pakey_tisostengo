'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.articoli-redazionali', {
        url: '/articoli-redazionali',
        templateUrl: 'app/admin/articoli-redazionali/articoli-redazionali.html',
        controller: 'AdminArticoliRedazionaliCtrl',
        controllerAs: 'articoli',
        requiredRole: 'admin'
      });
  });
