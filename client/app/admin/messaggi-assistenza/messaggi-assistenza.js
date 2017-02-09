'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.messaggi-assistenza', {
        url: '/messaggi-assistenza',
        templateUrl: 'app/admin/messaggi-assistenza/messaggi-assistenza.html',
        controller: 'AdminMessaggiAssistenzaCtrl',
        controllerAs: 'messaggi',
        requiredRole: 'admin'
      });
  });