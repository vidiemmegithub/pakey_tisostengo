'use strict';

angular.module('tisostengoApp')
  .controller('AdminHomeRedazionaleCtrl', function ($scope, apiClient, $uibModal, toastr) {
    var home = this;

    home.changeArticleEvidence = changeArticleEvidence;
    home.changeArticlePriority = changeArticlePriority;
    home.articles = {};
    home.modal = {};

    loadArticles();

    function loadArticles() {
      apiClient.articles.all({'editorial': 'true', 'evidence': 'true'}).then(function (res) {
        home.articles.evidence = res.data.articles;

        if (home.articles.evidence.length < 1) {
        	var evidence = home.articles.evidence.length;
        	for (; evidence < 1; evidence++) {
        		home.articles.evidence.push({title: 'Nessun articolo caricato'});
        	}
        }
      });

      apiClient.articles.all({'editorial': 'true', 'evidence': 'false', 'priority': 'true'}).then(function (res) {
        home.articles.priority = res.data.articles;

        if (home.articles.priority.length < 10) {
        	var priority = home.articles.priority.length;
        	for (; priority < 10; priority++) {
        		home.articles.priority.push({title: 'Nessun articolo caricato'});
        	}
        }
      });
    }

    function changeArticleEvidence(article) {
      home.modal.title = 'Scegli l\'articolo in evidenza';
      home.modal.param = {'editorial': 'true', 'evidence': 'false'};
      home.modal.isEvidence = true;
      changeArticle(article);
    }

    function changeArticlePriority(article) {
      home.modal.title = 'Scegli un articolo prioritario';
      home.modal.param = {'editorial': 'true', 'evidence': 'false', 'priority': 'false'};
      home.modal.isEvidence = false;
      changeArticle(article);
    }

    function changeArticle(article) {
      $uibModal.open({
        templateUrl: 'components/chooseArticleModal/chooseArticleModal.html',
        controller: function ($scope, articles) {
          "ngInject";

          $scope.title = home.modal.title;
          $scope.articles = articles;

          $scope.filter = function (article) {
            return !!article.pub_date;
          };
        },
        resolve: {
          articles: function (apiClient) {
            "ngInject";
            return apiClient.articles.all(home.modal.param).then(function (res) {
              return res.data.articles;
            });
          }
        }
      }).result.then(function (selectedArticle) {
        delete selectedArticle.text;
        delete article.text;

        if (home.modal.isEvidence) {
          selectedArticle.evidence = true;
          selectedArticle.priority = false;
          article.evidence = false;
        } else {
          selectedArticle.priority = true;
          article.priority = false;
        }
        return apiClient.articles.update(selectedArticle)
          .then(function () {
            if (article._id) {
              apiClient.articles.update(article).then(loadArticles);
            }
            toastr.success('Articolo aggiornato!');
            loadArticles();
          });
      });
    }
  });
