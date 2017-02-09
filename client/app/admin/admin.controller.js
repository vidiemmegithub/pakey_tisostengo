'use strict';

angular.module('tisostengoApp')
  .controller('AdminCtrl', function ($scope, $state, $location, apiClient) {
    var admin = this;

    initialize();

    function initialize() {
      // initialization code from sb-admin js
      // should no longer be needed as soon as this issue is integrated
      // https://github.com/onokumus/metisMenu/issues/67
      $('#side-menu').metisMenu();
      loadStatistics();
    }

    function loadStatistics() {
      apiClient.statistics.all().then(function (res) {
        admin.statistics = res.data.statistics;
      });
    }

    $scope.$on('$stateChangeSuccess', function () {
      if ($state.is('admin')) {
        loadStatistics();
      }
    });
  });
