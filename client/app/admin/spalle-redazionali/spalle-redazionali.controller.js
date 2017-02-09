'use strict';

angular.module('tisostengoApp')
  .controller('AdminSpalleRedazionaliCtrl', function ($scope, apiClient, $uibModal, toastr) {
    var spalla = this;

    spalla.changeArticleEvidenceUQ = changeArticleEvidenceUQ;
    spalla.changeArticleEvidenceUNQ = changeArticleEvidenceUNQ;
    spalla.articles = {};
    spalla.modal = {};

    loadArticles();

    function loadArticles() {
      apiClient.articles.all({'editorial': 'true', 'evidence_uq': 'true'}).then(function (res) {
        spalla.articles.evidence_uq = res.data.articles;

        if (spalla.articles.evidence_uq.length < 3) {
        	var evidence_uq = spalla.articles.evidence_uq.length;
        	for (; evidence_uq < 3; evidence_uq++) {
        		spalla.articles.evidence_uq.push({title: 'Nessun articolo caricato'});
        	}
        } 
      });

      apiClient.articles.all({'editorial': 'true', 'evidence_unq': 'true'}).then(function (res) {
        spalla.articles.evidence_unq = res.data.articles;

        if (spalla.articles.evidence_unq.length < 3) {
        	var evidence_unq = spalla.articles.evidence_unq.length;
        	for (; evidence_unq < 3; evidence_unq++) {
        		spalla.articles.evidence_unq.push({title: 'Nessun articolo caricato'});
        	}
        } 
      });
    }

    function changeArticleEvidenceUQ(article) {
      spalla.modal.title = 'Scegli un articolo in evidenza';
      spalla.modal.param = {'editorial': 'true', 'evidence_uq': 'false'};
      spalla.modal.isEvidenceUQ = true;
      changeArticle(article);
    }

    function changeArticleEvidenceUNQ(article) {
      spalla.modal.title = 'Scegli un articolo in evidenza';
      spalla.modal.param = {'editorial': 'true',  'evidence_unq': 'false'};
      spalla.modal.isEvidenceUQ = false;
      changeArticle(article);
    }

    function changeArticle(article) {
      $uibModal.open({
        templateUrl: 'components/chooseArticleModal/chooseArticleModal.html',
        controller: function ($scope, articles) {
          "ngInject";
          
          $scope.title = spalla.modal.title;
          $scope.articles = articles;

          $scope.filter = function (article) {
            return !!article.pub_date;
          };
        },
        resolve: {
          articles: function (apiClient) {
          "ngInject";
            return apiClient.articles.all(spalla.modal.param).then(function (res) {
              return res.data.articles;
            });
          }
        }
      }).result.then(function (selectedArticle) {
        delete selectedArticle.text;
        delete article.text;
        
        if (spalla.modal.isEvidenceUQ) {
          selectedArticle.evidence_uq = true;
          article.evidence_uq = false;
        } else {
          selectedArticle.evidence_unq = true;
          article.evidence_unq = false;
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
