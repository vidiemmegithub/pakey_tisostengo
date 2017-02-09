'use strict';

angular.module('tisostengoApp')
  .directive('articleBox', function () {
    return {
      templateUrl: 'app/directives/articleBox/articleBox.html',
      restrict: 'EA',
      scope: {
      	article: '='
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope) {

      }
    };
  });
