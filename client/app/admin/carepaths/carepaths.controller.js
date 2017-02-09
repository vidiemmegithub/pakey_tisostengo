 'use strict';

angular
  .module('tisostengoApp')
  .controller('AdminCarepathsController', function ($state, apiClient, $uibModal, $scope) {
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

    scope.remove = function(id) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Attenzione',
          content: "Sei sicuro di voler rimuovere il percorso di cura?"
        })
      }).result.then(function () {
        apiClient.carepaths
        .delete(id)
        .then(function (res) {
          $state.reload();
        });
      });
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
