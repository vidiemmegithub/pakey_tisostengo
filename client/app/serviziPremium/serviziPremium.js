'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('serviziPremium', {
        url: '/servizi-premium',
        templateUrl: 'app/serviziPremium/servizi-premium.html',
        controller: 'ServiziPremiumCtrl',
        controllerAs: 'premium',
        resolve: {
          plans: function (apiClient, $state) {
            return apiClient.payments.plans()
              .then(function (res) {
        			  return res.data;
      			  }, function () {
                $state.go('main');
            });
          },
          currentUser: function (User) {
            return User.get();
          }
        }
      });
  });
