'use strict';

angular.module('tisostengoApp')
  .controller('ProfessionistaCtrl', function ($scope, $location, $stateParams, apiClient, Auth, user, $uibModal, toastr) {
    var scope = this;

  	scope.isLoggedIn = Auth.isLoggedIn;
    scope.user = user;

    initialize();

    scope.isAdmin = function () {
      return (Auth.getCurrentUser().role === "admin");
    }

    scope.banUser = function () {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Ban utente',
          content: 'Sei sicuro di voler bannare l\'utente?'
        })
      }).result.then(function () {
        return apiClient.users.ban(scope.user._id)
          .then(function () {
            toastr.success('Utente bannato correttamente');
            $location.path('/admin');
          });
      });
    }

    scope.deleteUser = function () {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina utente',
          content: 'Sei sicuro di voler eliminare l\'utente?'
        })
      }).result.then(function () {
        return apiClient.users.delete(scope.user._id)
          .then(function () {
            toastr.success('Utente eliminato!');
            $location.path('/admin');
          });
      });
    }

    scope.removeBan = function () {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Riattivazione utente',
          content: 'Sei sicuro di voler riattivare l\'utente?'
        })
      }).result.then(function () {
        return apiClient.users.removeBan(scope.user._id)
          .then(function () {
            toastr.success('Utente riattivato correttamente');
            $location.path('/admin');
          });
      });
    }

    scope.showSubscriptions = function () {
      $uibModal.open({
        size: 'lg',
        templateUrl: 'components/premiumModal/premiumModal.html',
        scope: angular.extend($scope.$new(), {
          user: scope.user
        }),
        controller: function ($scope) {
          "ngInject";

          $scope.describeService = function(service) {
            return {
              'profile-pro': 'PERSONALIZZAZIONE DEL PROFILO',
              'ranking': 'INDICIZZAZIONE',
              'private-channel-unq': 'CANALE PRIVATO',
              'private-channel-uq': 'CANALE PRIVATO'
            }[service];
          }
        }
      });
    }

    scope.loadMoreArticles = function () {
      scope.currentPage++;
      loadArticles();
    };

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.articles = [];

      loadArticles();

      apiClient.users.listUserFollowed($stateParams.id, {}, [], 5, 0)
        .then(function (res) {
          scope.followed = res.data.users;
      });

      apiClient.tags.user($stateParams.id).then(function (res) {
        scope.tags = res.data.tags;
      });
    }

    scope.isPrivateChannel = function () {
      var result = false;
      if (scope.user) {
        angular.forEach((scope.user.subscriptions || []), function(value, key) {
          if (/^private-channel-(?=uq|unq)/.test(value.name))
            return result = value.active;
        });
      }
      return result;
    }

    scope.isPremium = function () {
      var result = false;
      if (scope.user) {
        angular.forEach((scope.user.subscriptions || []), function(value, key) {
          if (value.name === 'profile-pro')
            return result = true;
        });
      }
      return result;
    }

    function loadArticles() {
      if (scope.user) {
        scope.isLoadingArticles = true;

        apiClient.articles.list({"author": $stateParams.id},
          [],
          scope.pageSize,
          scope.currentPage)
          .then(function (res) {
            var articles = res.data.articles;

            if (articles.length) {
              scope.articles.push.apply(scope.articles, articles);
            } else {
              scope.noMoreArticles = true;
            }
          })
          .finally(function () {
            scope.isLoadingArticles = false;
          });
      }
    }
  });
