'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tags', {
        url: '/tags',
        templateUrl: 'app/tags/tags.html',
        controller: 'TagsCtrl',
        controllerAs: 'tags'
      });
  });
