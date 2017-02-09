'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('professionista', {
        url: '/professionista/:id',
        templateUrl: 'app/professionista/professionista.html',
        controller: 'ProfessionistaCtrl',
        controllerAs: 'professionista',
        resolve: {
          user: function ($stateParams, apiClient, $state) {
          	var statistics = "follower,articles,questions.received";
            return apiClient.users.get($stateParams.id, statistics, {}, [])
      				.then(function (res) {
        				return res.data;
      				}, function () {
      					$state.go('professionisti')
      				});
          }
        },
      });
  });
