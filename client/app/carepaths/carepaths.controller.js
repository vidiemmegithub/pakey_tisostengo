 'use strict';

angular
  .module('tisostengoApp')
  .controller('CarepathsController', function (apiClient) {
    var scope = this;

    scope.search = function(filter) {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.carepaths = [];
      scope.filter = filter;

      load();
    };

    scope.emptySearch = function(filter) {
      if(filter === '') {
        scope.search();
      }
    };

    scope.loadMore = function () {
      scope.currentPage++;
      load();
    };

    initialize();

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.carepaths = [];

      apiClient.articles.listMostFollowed({}, [], 4, 0).then(function (res) {
          scope.articles = res.data.articles;
        });

      apiClient.tags.list().then(function (res) {
        scope.tags = res.data.tags;
      });

      load();
    }

    function load() {
      scope.isLoading = true;

      apiClient.carepaths
        .list(scope.filter, scope.pageSize, scope.currentPage)
        .then(function (res) {
          if (res.data.elements && res.data.elements.length > 0) {
            scope.carepaths.push.apply(scope.carepaths, res.data.elements);
            scope.noMore = false;
          } else {
            scope.noMore = true;
          }
        })
        .finally(function () {
          scope.isLoading = false;
        });
    }

  });
