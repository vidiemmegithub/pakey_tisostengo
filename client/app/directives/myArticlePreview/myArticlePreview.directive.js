'use strict';

angular.module('tisostengoApp')
  .directive('myArticlePreview', function () {
    return {
      templateUrl: 'app/directives/myArticlePreview/myArticlePreview.html',
      restrict: 'EA',
      scope: {
      	article: '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
