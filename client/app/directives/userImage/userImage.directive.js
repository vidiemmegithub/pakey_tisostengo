'use strict';

angular.module('tisostengoApp')
  .directive('userImage', function () {
    function setDefaultImage(scope) {
      scope.userImgUrl = 'assets/images/uqplaceholder.jpg'
    }

    return {
      templateUrl: 'app/directives/userImage/userImage.html',
      replace: true,
      restrict: 'E',
      scope: {
        user: '=',
        width: '=',
        height: '=',
        size: '=',
        method: '='
      },
      link: function (scope, element, attrs) {
        setDefaultImage(scope);
      },
      controller: function ($scope, apiClient) {
        $scope.$watch('user._id', function (userId) {
          if (!userId) return setDefaultImage($scope);
          apiClient.images.image('users', userId, $scope.width, $scope.height, $scope.method)
            .then(function (res) {
              $scope.userImgUrl = res.data;
            });
        });
      }
    };
  });
