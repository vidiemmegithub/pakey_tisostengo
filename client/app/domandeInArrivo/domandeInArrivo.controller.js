'use strict';

angular.module('tisostengoApp')
  .controller('DomandeInArrivoCtrl', function ($scope, apiClient) {
  	var scope = this;

    $scope.asAnswer = function(el) {
      return el.answer;
    };

    $scope.notAnswer = function(el) {
      return !el.answer;
    };

    initialize();

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 100;
      scope.questions = [];

      loadUser();

      $scope.$on('$destroy', $scope.$watchCollection('domandeInArrivo.filters', handleFilterChange));
    }

    function loadUser() {
      var statistics = "questions.received,questions.sent,answers.received,answers.sent";
      apiClient.users.me(statistics, {}, [])
      .then(function (res) {
        scope.user = res.data;
      });
    }

    function loadQuestions() {
    	apiClient.questions.incoming({}, []).then(function (res) {
      	scope.questions = res.data.questions;
      });
    }

    function handleFilterChange() {
      scope.currentPage = 0;
      scope.questions = [];

      loadQuestions();
    }
  });
