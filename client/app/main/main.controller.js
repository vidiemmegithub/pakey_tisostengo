'use strict';

angular.module('tisostengoApp')
  .controller('MainCtrl', function ($log, apiClient, $q) {
    var scope = this;

    initialize();

    function initialize() {
      scope.articles = [];

      loadArticles();
      loadQuestions();
      loadTags();

      scope.myInterval = 5000;
      scope.noWrapSlides = false;

      scope.slides = [{
        image: '/assets/images/banner_UNQ.jpg',
        text: '',
        url: ''
      }, {
        image: '/assets/images/banner_UQ.jpg',
        text: '',
        url: ''
      }];
    }

    function loadArticles() {
      var _promises = {
        evidence: apiClient.articles.list({'evidence': 'true', 'editorial': 'true'}, [], 1, 0),
        priority: apiClient.articles.list({'evidence': 'false', 'editorial': 'true', 'priority': 'true'}, [], 10, 0),
        editorial: apiClient.articles.list({'evidence': 'false', 'editorial': 'true', 'priority': 'false'}, [], 10, 0)
      }
      $q.all(_promises).then(function (results) {
        var _articles = [];

        var _evidence = results['evidence'].data.articles;
        var _priority = results['priority'].data.articles;
        var _editorial = results['editorial'].data.articles;

        Array.prototype.push.apply(_articles, _evidence);

        if (_priority.length <= 0) {
          Array.prototype.push.apply(_articles, _editorial);
        } else {
          for (var indexP = 0; indexP < _priority.length; indexP++) {
            _articles.push(_priority[indexP]);
            if (_editorial.length > indexP*2) {
              _articles.push(_editorial[indexP*2]);
            }
            if (_editorial.length > indexP*2+1) {
              _articles.push(_editorial[indexP*2+1]);
            }
          }

          for (var indexE = indexP*2+1; indexE < _editorial.length; indexE++) {
            _articles.push(_editorial[indexE]);
          }
        }

        scope.articles = _articles;
      });
    }

    function loadQuestions() {
      apiClient.questions.list({}, [], 4, 0).then(function (res) {
        scope.questions = res.data.questions;
      });
    }

    function loadTags() {
      apiClient.tags.list(15, 0).then(function (res) {
        scope.tags = res.data.tags;
      });
    }
  });
