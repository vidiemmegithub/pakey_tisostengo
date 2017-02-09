'use strict';

angular.module('tisostengoApp')
  .directive('questionPreview', function () {
    return {
      templateUrl: 'app/directives/questionPreview/questionPreview.html',
      restrict: 'EA',
      scope: {
      	questions: '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
