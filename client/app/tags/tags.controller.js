'use strict';

angular.module('tisostengoApp')
  .controller('TagsCtrl', function (apiClient) {
  	var scope = this;

    apiClient.tags.list().then(function (res) {
      scope.tags = res.data.tags;
    });
  });
