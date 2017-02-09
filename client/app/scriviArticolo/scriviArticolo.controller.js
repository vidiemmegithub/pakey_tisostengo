'use strict';

angular.module('tisostengoApp')
  .controller('ScriviArticoloCtrl', function ($filter, $scope, Auth, $uibModal, apiClient, Upload, article, Modal, $location) {
    var scriviArticolo = this;

    scriviArticolo.getCurrentUser = Auth.getCurrentUser;
    scriviArticolo.article = article;
    scriviArticolo.isExistingArticle = !!article;
    scriviArticolo.hasPicture = hasPicture;

    scriviArticolo.stripFormat = function ($html) {
      return $html;
      return $filter('htmlToPlainText')($html);
    };

    scriviArticolo.submitArticle = function (article) {
      if (article.pictureFile) {
        Upload.upload({
          url: '/api/upload/articles',
          file: article.pictureFile
        }).then(function (res) {
          article.pictureName = res.data.name;
          article.thumbnail = res.data.location;
          createUpdateArticle(article);
        }, function (res) {
          createUpdateArticle(article);
        });
      } else {
        createUpdateArticle(article);
      }
    };

    scriviArticolo.deleteArticle = function () {
      Modal.confirm.delete(function(){
        apiClient.articles.delete(scriviArticolo.article._id).then(function(){
          $location.path('/miei-articoli');
        });
      })('questo articolo');
    };

    function createUpdateArticle(article) {
      apiClient.articles[scriviArticolo.isExistingArticle ? 'update' : 'create'](article)
        .then(function (result) {
          openModal(true);
        }, function (fail) {
          openModal(false);
        });
    }

    function openModal(isOk) {
      $uibModal.open({
        templateUrl: 'components/actionResult/actionResult.html',
        controller: function ($scope, $modalInstance) {
          // ng-annotate does not recognize $uibModal yet
          // see https://github.com/olov/ng-annotate/issues/200
          "ngInject";

          $scope.isOk = isOk;
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        },
        backdrop: 'static'
      });
    }

    function hasPicture(article) {
      return article && (article.pictureFile || article.thumbnail);
    }
  });
