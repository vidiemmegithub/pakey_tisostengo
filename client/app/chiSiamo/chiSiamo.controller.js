'use strict';

angular.module('tisostengoApp')
  .controller('ChiSiamoCtrl', function ($scope, apiClient) {
    var scope = this;

    apiClient.articles.listMostFollowed({}, [], 4, 0).then(function (res) {
        scope.articles = res.data.articles;
      });
  });
