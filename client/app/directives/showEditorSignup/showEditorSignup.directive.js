'use strict';

angular.module('tisostengoApp')
  .directive('showEditorSignup', function () {
    return {
      templateUrl: 'app/directives/showEditorSignup/showEditorSignup.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
