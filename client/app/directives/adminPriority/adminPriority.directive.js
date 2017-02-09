'use strict';

angular.module('tisostengoApp')
  .directive('adminPriority', function () {
    return {
      templateUrl: 'app/directives/adminPriority/adminPriority.html',
      restrict: 'EA',
      scope: {
        articles: '=',
        onChangeArticle: '&'
      },
      link: function (scope, element, attrs) {
      }
    };
  });
