'use strict';

angular.module('tisostengoApp')
  .directive('segnalaAbuso', function () {
    return {
      templateUrl: 'app/directives/segnalaAbuso/segnalaAbuso.html',
      restrict: 'EA',
      scope: {
        type: '@',
        id: '@'
      },
      link: function (scope, element, attrs) {
      }
    };
  });
