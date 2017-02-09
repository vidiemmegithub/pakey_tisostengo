'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mieiArticoli', {
        url: '/miei-articoli',
        templateUrl: 'app/mieiArticoli/miei-articoli.html',
        controller: 'MieiArticoliCtrl',
        controllerAs: 'mieiArticoli',
        authenticate: true,
        resolve: {
          currentUser: function (User) {
            return User.get().$promise.then(function (user) {
              return user;
            });
          }
        },
      });
  });
