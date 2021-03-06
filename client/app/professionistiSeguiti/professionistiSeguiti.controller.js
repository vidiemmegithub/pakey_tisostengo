'use strict';

angular.module('tisostengoApp')
  .controller('ProfessionistiSeguitiCtrl', function ($scope, Auth, apiClient) {
    var scope = this;

    scope.loadMoreProfessionisti = function () {
      scope.currentPage++;
      loadProfessionisti();
    };

    initialize();

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.professionisti = [];

      apiClient.users.listMostFollowed({}, [], 4, 0)
        .then(function (res) {
          scope.followed = res.data.users;
      });

      $scope.$on('$destroy', $scope.$watchCollection('professionistiSeguiti.filters', handleFilterChange));
    }

    function loadProfessionisti() {
      scope.isLoadingProfessionisti = true;

      apiClient.users.listFollowed(scope.filters, [], scope.pageSize, scope.currentPage)
        .then(function (res) {
          var users = res.data.users;

          if (users.length) {
            scope.professionisti.push.apply(scope.professionisti, users);
          } else {
            scope.noMoreProfessionisti = true;
          }
        })
        .finally(function () {
          scope.isLoadingProfessionisti = false;
        });
    }

    function handleFilterChange() {
      scope.currentPage = 0;
      scope.professionisti = [];

      loadProfessionisti();
    }
  });
