'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tag', {
        url: '/tag/:id',
        templateUrl: 'app/tag/tag.html',
        controller: 'TagCtrl',
        controllerAs: 'tag'
      });
  });
