'use strict';

angular.module('tisostengoApp')
.directive('articleImage', function () {
  return {
    templateUrl: 'app/directives/articleImage/articleImage.html',
    replace: true,
    restrict: 'E',
    scope: {
      article: '=',
      width: '=',
      height: '=',
      size: '=',
      method: '='
    },
    link: function (scope, element, attrs) {
      scope.articleImgUrl = 'assets/images/placeholder/article_placeholder_' + scope.size + '.jpg';
    },
    controller: function ($scope, apiClient) {
      $scope.$watch('article', function(article){
        if(!article) return;
        apiClient.images.image('articles', $scope.article._id, $scope.width, $scope.height, $scope.method)
        .then(function (res) {
          $scope.articleImgUrl = res.data;
        });
      });
    }
  };
});
