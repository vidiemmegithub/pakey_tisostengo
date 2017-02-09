'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('articolo', {
        url: '/articolo/:id',
        templateUrl: 'app/articolo/articolo.html',
        controller: 'ArticoloCtrl',
        controllerAs: 'articolo',
        resolve: {
          article: function ($stateParams, apiClient, $state) {
            return apiClient.articles.get($stateParams.id, {}, [])
      				.then(function (res) {
        				return res.data;
      				}, function () {
                $state.go('articoli');
              });
          }
        },
      });
  });
