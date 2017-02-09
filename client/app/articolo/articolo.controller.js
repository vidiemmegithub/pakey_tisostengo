'use strict';

angular.module('tisostengoApp')
  .controller('ArticoloCtrl', function ($scope, $window, Auth, apiClient, article, $uibModal, toastr, $location) {
    var scope = this;

    scope.isLoggedIn = Auth.isLoggedIn;
    scope.articleUrl = $window.location.toString();
    //scope.articleUrl = '/api/articles/share/' + article._id;
    scope.article = article;

    apiClient.articles.list({ tags: scope.article.tags, _id: '!' + scope.article._id }, [], 5, 0)
      .then(function (res) {
        scope.simili = res.data.articles;
      });

    scope.isSelf = function () {
      return (Auth.getCurrentUser()._id === scope.article.author._id);
    }

    scope.isAdmin = function () {
      return (Auth.getCurrentUser().role === "admin");
    }

    scope.publishArticle = function () {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Pubblica articolo',
          content: 'Sei sicuro di voler pubblicare l\'articolo?'
        })
      }).result.then(function () {
        return apiClient.articles.publish(scope.article._id)
          .then(function () {
            apiClient.articles.get(scope.article._id, {}, [])
              .then(function (res) {
                scope.article = res.data;
                toastr.success('Articolo pubblicato!');
              });
          });
      });
    }

    scope.unpublishArticle = function () {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Nascondi articolo',
          content: 'Sei sicuro di voler nascondere l\'articolo?'
        })
      }).result.then(function () {
        return apiClient.articles.unpublish(scope.article._id)
          .then(function () {
            apiClient.articles.get(scope.article._id, {}, [])
              .then(function (res) {
                scope.article = res.data;
                toastr.success('Articolo nascosto!');
              });
          });
      });
    }

    scope.deleteArticle = function () {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina articolo',
          content: 'Sei sicuro di voler eliminare l\'articolo?'
        })
      }).result.then(function () {
        return apiClient.articles.delete(scope.article._id)
          .then(function () {
            toastr.success('Articolo eliminato!');
            $location.path('/admin');
          });
      });
    }
  });
