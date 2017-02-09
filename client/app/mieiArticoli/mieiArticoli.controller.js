'use strict';

angular.module('tisostengoApp')
  .controller('MieiArticoliCtrl', function (currentUser, apiClient) {

    console.log(currentUser);
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

      loadArticles();
      loadTags();
    };

    function loadArticles() {
    	scope.isLoadingArticles = true;
      apiClient.articles.me({},
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
    };

    function handleFilterChange() {
      scope.currentPage = 0;
      scope.articles = [];

      loadArticles();
    };

    function loadTags() {
    	apiClient.tags.user(currentUser._id)
    		.then(function(res) {
    			scope.tags = res.data.tags;
    		});
    };
  });
