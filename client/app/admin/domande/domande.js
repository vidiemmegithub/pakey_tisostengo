'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.domande', {
        url: '/domande',
        templateUrl: 'app/admin/domande/domande.html',
        controller: 'AdminDomandeCtrl',
        controllerAs: 'domande',
        requiredRole: 'admin'
      });
  });