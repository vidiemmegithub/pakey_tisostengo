'use strict';

angular.module('tisostengoApp')
  .directive('segui', function () {
    return {
      templateUrl: 'app/directives/segui/segui.html',
      restrict: 'EA',
      scope: {
      	professionista: '='
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope, apiClient, Auth) {
      	$scope.isLoggedIn = Auth.isLoggedIn;
        $scope.getCurrentUser = Auth.getCurrentUser;
        $scope.disable = false;

        $scope.isJustPresent = function(id) {
          return _.contains($scope.getCurrentUser().followed, id);
        }

        $scope.isAdmin = function () {
          return (Auth.getCurrentUser().role === 'admin');
        }

      	$scope.segui = function(id) {
          $scope.disable = true;
          if ($scope.isJustPresent(id)) {
            apiClient.users.removeFollowed({id: id}).then(function() {
              $scope.professionista.statistics.follower -= 1;
              Auth.reloadUser().then(function() {
                $scope.disable = false;
              });
            });
          } else {
            apiClient.users.addFollowed({id: id}).then(function() {
              $scope.professionista.statistics.follower += 1;
              Auth.reloadUser().then(function() {
                $scope.disable = false;
              });
            });
          }
      	}
      }
    };
  });
