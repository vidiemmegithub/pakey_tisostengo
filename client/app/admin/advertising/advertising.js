'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.advertising', {
        url: '/advertising',
        templateUrl: 'app/admin/advertising/advertising.html',
        controller: 'AdminAdvertisingCtrl',
        controllerAs: 'advertising',
        requiredRole: 'admin'
      });
  });
