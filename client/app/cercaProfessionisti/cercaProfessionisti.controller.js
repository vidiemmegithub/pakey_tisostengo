'use strict';

angular.module('tisostengoApp')
  .controller('CercaProfessionistiCtrl', function ($stateParams, apiClient, $scope, Auth) {
    var scope = this;

    scope.text = $stateParams.id;

    scope.loadMoreProfessionisti = function () {
      scope.currentPage++;
      loadProfessionisti();
    };

    scope.qualifiedUserWithoutRankingSubscription = function() {
      return Auth.isQualified() && !Auth.hasActiveSubscription('ranking');
    };

    initialize();

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.professionisti = [];

      loadPremiumProfessionisti();

      $scope.$on('$destroy', $scope.$watchCollection('cercaProfessionisti.filters', handleFilterChange));
    }

    function loadPremiumProfessionisti() {
      apiClient.search.premiumUsers(scope.text)
        .then(function (res) {
          scope.professionistiPremium = res.data.users;
        });
    }

    function loadProfessionisti() {
      scope.isLoadingProfessionisti = true;

      apiClient.search.users(scope.text, scope.filters, scope.pageSize, scope.currentPage)
        .then(function (res) {
          var users = res.data.users;

          if (users.length) {
            scope.professionisti.push.apply(scope.professionisti, users);
            scope.noMoreProfessionisti = false;
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
