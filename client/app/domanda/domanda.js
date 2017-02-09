'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('domanda', {
        url: '/domanda/:id',
        templateUrl: 'app/domanda/domanda.html',
        controller: 'DomandaCtrl',
        controllerAs: 'domanda',
        resolve: {
          question: function ($stateParams, apiClient, $state) {
            return apiClient.questions.get($stateParams.id, {}, [])
      				.then(function (res) {
        				return res.data;
      				}, function () {
      					$state.go('domande')
      				});
          }
        },
      });
  });
