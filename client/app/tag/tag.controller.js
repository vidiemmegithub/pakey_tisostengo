'use strict';

angular.module('tisostengoApp')
  .controller('TagCtrl', function ($stateParams, apiClient) {
    var scope = this;

    scope.tag = $stateParams.id;

    scope.loadMoreArticles = function () {
      scope.currentPageArticle++;
      loadArticles();
    };

    scope.loadMoreQuestions = function () {
      scope.currentPageQuestion++;
      loadQuestions();
    };

    initialize();

    function initialize() {
      scope.currentPageArticle = 0;
      scope.currentPageQuestion = 0;
      scope.pageSize = 10;
      scope.articles = [];
      scope.questions = [];

      loadArticles();
      loadQuestions();

      apiClient.tags.list().then(function (res) {
        scope.tags = res.data.tags;
      });
    }

    function loadArticles() {
      scope.isLoadingArticles = true;
      apiClient.articles.list({tags: scope.tag}, [], scope.pageSize, scope.currentPageArticle)
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

    function loadQuestions() {
      scope.isLoadingQuestions = true;

      apiClient.questions.list({tags: scope.tag}, [], scope.pageSize, scope.currentPageQuestion)
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
  });
