'use strict';

angular.module('tisostengoApp')
  .directive('searchBar', function () {
    return {
      templateUrl: 'app/directives/searchBar/searchBar.html',
      restrict: 'EA',
      scope: {
      	model: '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
