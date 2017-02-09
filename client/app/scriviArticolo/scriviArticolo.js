'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('scriviArticolo', {
        url: '/scrivi-articolo/:id?',
        templateUrl: 'app/scriviArticolo/scrivi-articolo.html',
        controller: 'ScriviArticoloCtrl',
        controllerAs: 'scriviArticolo',
        params: {
          id: { value: null, squash: true }
        },
        resolve: {
          article: function ($stateParams, apiClient) {
            return $stateParams.id && apiClient.articles.get($stateParams.id, {},
                ['title',
                  'text',
                  'thumbnail',
                  'category',
                  'pub_date',
                  'author',
                  'tags']).then(function (res) {
                return res.data;
              });
          }
        },
        authenticate: true
      });
  });
