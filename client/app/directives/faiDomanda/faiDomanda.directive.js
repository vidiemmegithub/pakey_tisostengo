'use strict';

angular.module('tisostengoApp')
  .directive('faiDomanda', function () {
    return {
      templateUrl: 'app/directives/faiDomanda/faiDomanda.html',
      restrict: 'EA',
      scope: {
      	userId: '='
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope, Auth) {
        $scope.isLoggedIn = Auth.isLoggedIn;

        $scope.isSelf = function () {
          return (Auth.getCurrentUser()._id === $scope.userId);
        };

        $scope.isAdmin = function () {
          return (Auth.getCurrentUser().role === 'admin');
        };
      }
    };
  });
