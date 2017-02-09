'use strict';

angular.module('tisostengoApp')
  .directive('articlePreview', function () {
    return {
      templateUrl: 'app/directives/articlePreview/articlePreview.html',
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
