'use strict';

angular.module('tisostengoApp')
  .directive('professionistaIscriviti', function () {
    return {
      templateUrl: 'app/directives/professionistaIscriviti/professionistaIscriviti.html',
      restrict: 'EA',
      transclude: true,
      link: function (scope, element, attrs) {
      },
      controller: function($scope, Auth) {
        $scope.isLoggedIn = Auth.isLoggedIn;
      }
    };
  });
