'use strict';

angular.module('tisostengoApp')
  .directive('authorBox', function () {
    return {
      templateUrl: 'app/directives/authorBox/authorBox.html',
      restrict: 'EA',
      scope: {
      	author: '='
      },
      link: function (scope, element, attrs) {
      	if ("questionId" in attrs) {
      		scope.questionId = attrs.questionId;
     		}
      }
    };
  });
