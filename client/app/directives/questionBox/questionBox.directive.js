'use strict';

angular.module('tisostengoApp')
  .directive('questionBox', function () {
    return {
      templateUrl: 'app/directives/questionBox/questionBox.html',
      restrict: 'EA',
      scope: {
      	question: '='
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope) {

      }
    };
  });
