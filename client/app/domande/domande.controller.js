'use strict';

angular.module('tisostengoApp')
  .controller('DomandeCtrl', function ($scope, apiClient) {
    var scope = this;

    scope.loadMoreQuestions = function () {
      scope.currentPage++;
      loadQuestions();
    };

    initialize();

    scope.logga = function () {
      console.log('CIAO');
    };

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.questions = [];

      apiClient.questions.listMostFollowed({}, [], 4, 0)
        .then(function (res) {
          scope.followed = res.data.questions;
        });

      apiClient.users.listRequested({}, [], 4, 0)
        .then(function (res) {
          scope.professionisti = res.data.users;
        });

      $scope.$on('$destroy', $scope.$watchCollection('domande.filters', handleFilterChange));
    }

    function loadQuestions() {
      scope.isLoadingQuestions = true;

      apiClient.questions.list(scope.filters, [], scope.pageSize, scope.currentPage)
        .then(function (res) {
          var questions = res.data.questions;

          if (questions.length) {
            scope.questions.push.apply(scope.questions, questions);
            scope.noMoreQuestions = false;
          } else {
            scope.noMoreQuestions = true;
          }
        })
        .finally(function () {
          scope.isLoadingQuestions = false;
        });
    }

    function handleFilterChange() {
      scope.currentPage = 0;
      scope.questions = [];

      loadQuestions();
    }
  });
