'use strict';

angular.module('tisostengoApp')
  .directive('tagList', function () {
    return {
      templateUrl: 'app/directives/tagList/tagList.html',
      restrict: 'EA',
      scope: {
        tags: '=',
        limit: '='
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope, $location) {
      	$scope.goTo = function(tag) {
      		$location.path('/tag/' + tag);
      	};
      }
    };
  });
