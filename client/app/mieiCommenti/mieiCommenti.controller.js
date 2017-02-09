'use strict';

angular.module('tisostengoApp')
  .controller('MieiCommentiCtrl', function (apiClient) {
    var scope = this;

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
    }

    function loadArticles() {
      scope.isLoadingArticles = true;
      apiClient.comments.getArticles({}, [], scope.pageSize, scope.currentPageArticle)
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

      apiClient.comments.getQuestions({}, [], scope.pageSize, scope.currentPageQuestion)
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
