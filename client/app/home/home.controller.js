'use strict';

angular.module('tisostengoApp')
  .controller('HomeCtrl', function (apiClient, Auth, $scope,  $stateParams, user) {
    var scope = this;

    scope.isQualified = Auth.isQualified;
    scope.isUnqualified = Auth.isUnqualified;
    scope.isEditor = Auth.isEditor;

    scope.user = user;
    
    initialize();

    function initialize() {
      scope.articles = [];
      
      loadArticles();
      loadArticlesRed();
      loadQuestion();
      loadComments();
    }

    function loadArticles() {
      apiClient.articles.listAllFollowed({}, [], 15, 0)
        .then(function (res) {
          var articles = res.data.articles;

          if (articles.length) {
            scope.articles.push.apply(scope.articles, articles);
          }
        });
    }

    function loadArticlesRed() {
      var param = {editorial: 'true'};
      if (scope.user.role === 'qualified') {
        param = {editorial: 'true', evidence_uq: 'true'};
      } else if (scope.user.role === 'unqualified') {
        param = {editorial: 'true', evidence_unq: 'true'};
      }

      apiClient.articles.list(param, [], 4, 0)
        .then(function (res) {
          scope.articlesRed = res.data.articles;
        });
    }

    function loadQuestion() {
      apiClient.questions.listFollowed({}, [], 4, 0)
        .then(function (res) {
          scope.questions = res.data.questions;
        });
    }

    function loadComments() {
      apiClient.comments.get(4, 0)
        .then(function (res) {
          scope.comments = res.data;
        });
    }
  });
