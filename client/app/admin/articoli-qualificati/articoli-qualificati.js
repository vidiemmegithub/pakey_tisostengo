'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.articoli-qualificati', {
        url: '/articoli-qualificati',
        templateUrl: 'app/admin/articoli-qualificati/articoli-qualificati.html',
        controller: 'AdminArticoliQualificatiCtrl',
        controllerAs: 'articoli',
        requiredRole: 'admin'
      });
  });
