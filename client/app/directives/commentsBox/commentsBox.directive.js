'use strict';

angular.module('tisostengoApp')
  .directive('commentsBox', function () {
    return {
      templateUrl: 'app/directives/commentsBox/commentsBox.html',
      restrict: 'EA',
      scope: {
      	comment: '='
      }
    };
  });
