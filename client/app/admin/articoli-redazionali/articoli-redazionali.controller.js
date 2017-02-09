'use strict';

angular.module('tisostengoApp')
  .controller('AdminArticoliRedazionaliCtrl', function ($scope, apiClient, $uibModal, toastr) {
    var articoli = this;

    articoli.publish = publishArticle;
    articoli.unpublish = unpublishArticle;
    articoli.delete = deleteArticle;

    loadArticles();

    $scope.$watch("articoli.articles | filterFromList:articoli.searchText", function(newVal) {
      articoli.filteredArticles = newVal;
    }, true);

    function loadArticles() {
      apiClient.articles.all({'editorial': 'true'}).then(function (res) {
        articoli.articles = res.data.articles;
      });
    }

    function publishArticle(article) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Pubblica articolo',
          content: 'Sei sicuro di voler pubblicare l\'articolo?'
        })
      }).result.then(function () {
        return apiClient.articles.publish(article._id)
          .then(function () {
            toastr.success('Articolo pubblicato');
            loadArticles();
          });
      });
    }

    function unpublishArticle(article) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Depubblica articolo',
          content: 'Sei sicuro di voler depubblicare l\'articolo?'
        })
      }).result.then(function () {
        return apiClient.articles.unpublish(article._id)
          .then(function () {
            toastr.success('Articolo depubblicato');
            loadArticles();
          });
      });
    }

    function deleteArticle(article) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina articolo',
          content: 'Sei sicuro di voler eliminare l\'articolo? L\'operazione non è reversibile'
        })
      }).result.then(function () {
        return apiClient.articles.delete(article._id)
          .then(function () {
            toastr.success('Articolo eliminato');
            loadArticles();
          });
      });
    }
  });
