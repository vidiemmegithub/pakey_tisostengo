'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.messaggi-info', {
        url: '/messaggi-info',
        templateUrl: 'app/admin/messaggi-info/messaggi-info.html',
        controller: 'AdminMessaggiInfoCtrl',
        controllerAs: 'messaggi',
        requiredRole: 'admin'
      });
  });