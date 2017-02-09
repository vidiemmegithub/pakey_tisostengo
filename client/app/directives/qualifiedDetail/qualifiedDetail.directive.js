'use strict';

angular.module('tisostengoApp')
  .directive('qualifiedDetail', function () {
    return {
      templateUrl: 'app/directives/qualifiedDetail/qualifiedDetail.html',
      restrict: 'EA',
      scope: {
      	professionista: '='
      },
      link: function (scope, element, attrs) {

      },
      controller: function($scope, Auth) {
        $scope.isLoggedIn = Auth.isLoggedIn;

        $scope.isPrivateChannel = function (user) {
          var result = false;
          if (user) {
            angular.forEach((user.subscriptions || []), function(value, key) {
              if (/^private-channel-(?=uq|unq)/.test(value.name))
                return result = value.active;
            });
          }
          return result;
        }
      }
    };
  });