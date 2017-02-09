'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.messaggi-abusi', {
        url: '/messaggi-abusi',
        templateUrl: 'app/admin/messaggi-abusi/messaggi-abusi.html',
        controller: 'AdminMessaggiAbusiCtrl',
        controllerAs: 'messaggi',
        requiredRole: 'admin'
      });
  });