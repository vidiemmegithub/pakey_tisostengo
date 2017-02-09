'use strict';

angular.module('tisostengoApp')
  .controller('AdminArticoliQualificatiCtrl', function ($scope, apiClient, $uibModal, toastr) {
  	var articoli = this;

    articoli.delete = deleteArticle;

    loadArticles();

    $scope.$watch("articoli.articles | filterFromList:articoli.searchText", function(newVal) {
      articoli.filteredArticles = newVal;
    }, true);

    function loadArticles() {
      apiClient.articles.list({'editorial': 'false'}).then(function (res) {
        articoli.articles = res.data.articles;
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
            toastr.success('Articolo eliminato!');
            loadArticles();
          });
      });
    }
  });
