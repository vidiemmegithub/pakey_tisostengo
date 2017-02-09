'use strict';

angular.module('tisostengoApp')
  .directive('adminArticles', function () {
    return {
      templateUrl: 'app/directives/adminArticles/adminArticles.html',
      restrict: 'EA',
      scope: {
        articles: '=',
        published: '=',
        editorial: '=',
        onPublishArticle: '&',
        onUnpublishArticle: '&',
        onDeleteArticle: '&'
      },
      link: function (scope, element, attrs) {
        scope.filter = function (article) {
          return scope.published ? !!article.pub_date : !article.pub_date;
        };
      }
    };
  });
