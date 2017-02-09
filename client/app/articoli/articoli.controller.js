'use strict';

angular.module('tisostengoApp')
  .controller('ArticoliCtrl', function ($scope, apiClient) {
    var scope = this;

    scope.loadMoreArticles = function () {
      scope.currentPage++;
      loadArticles();
    };

    initialize();

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.articles = [];

      apiClient.tags.list().then(function (res) {
        scope.tags = res.data.tags;
      });

      apiClient.articles.listMostFollowed({}, [], 4, 0).then(function (res) {
        scope.followed = res.data.articles;
      });

      $scope.$on('$destroy', $scope.$watchCollection('articoli.filters', handleFilterChange));
    }

    function loadArticles() {
      scope.isLoadingArticles = true;
      apiClient.articles.list(scope.filters,
        [],
        scope.pageSize,
        scope.currentPage)
        .then(function (res) {
          var articles = res.data.articles;

          if (articles.length) {
            scope.articles.push.apply(scope.articles, articles);
            scope.noMoreArticles = false;
          } else {
            scope.noMoreArticles = true;
          }
        })
        .finally(function () {
          scope.isLoadingArticles = false;
        });
    }

    function handleFilterChange() {
      scope.currentPage = 0;
      scope.articles = [];

      loadArticles();
    }
  });
