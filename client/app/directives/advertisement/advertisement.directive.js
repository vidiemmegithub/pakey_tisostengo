'use strict';

angular.module('tisostengoApp')
  .directive('advertisement', function () {
    return {
      templateUrl: 'app/directives/advertisement/advertisement.html',
      restrict: 'EA',
      scope: {
        home: '='
      },
      controller: function ($scope, apiClient) {
        apiClient.advertisements.showNext($scope.home)
          .then(function (res) {
            if (res.data) {
              $scope.picture = res.data.picture;
              $scope.link = res.data.link;
            } else {
              $scope.picture = 'assets/images/adv_square250.jpg'
              $scope.link = 'contatta';
            }
          }, function (fail) {
            $scope.picture = 'assets/images/adv_square250.jpg'
            $scope.link = 'contatta';
            console.log(fail);
          });
      }
    };
  });
