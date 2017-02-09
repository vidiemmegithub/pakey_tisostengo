'use strict';

angular.module('tisostengoApp')
  .directive('qualifiedBox', function () {
    return {
      templateUrl: 'app/directives/qualifiedBox/qualifiedBox.html',
      restrict: 'EA',
      scope: {
      	professionista: '='
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope) {

      }
    };
  });
