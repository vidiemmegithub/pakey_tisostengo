'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('riepilogoPremium', {
        url: '/riepilogo-premium?service',
        templateUrl: 'app/riepilogoPremium/riepilogo-premium.html',
        controller: 'RiepilogoPremiumCtrl',
        controllerAs: 'riepilogo',
        authenticate: true,
        ifNotAuthenticate: 'serviziPremium',
        resolve: {
          service:  function($state, $q, sharedData) {
            var service = sharedData.getService();
            if (service) {
              return service;
            }
            else {
              return $q.reject().catch(function() { 
                $state.go('serviziPremium'); 
                return $q.reject();
              });
            }
          },
          currentUser: function (User) {
            return User.get();
          }
        }
      });
  });
