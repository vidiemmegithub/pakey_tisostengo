'use strict';

angular.module('tisostengoApp')
  .controller('DomandaCtrl', function ($scope, apiClient, Auth, question, $uibModal, toastr) {
    var scope = this;

    scope.isLoggedIn = Auth.isLoggedIn;
    scope.getCurrentUser = Auth.getCurrentUser;
    scope.question = question;

    apiClient.questions.list(scope.filters, [], scope.pageSize, scope.currentPage)
      .then(function (res) {
        scope.questions = res.data.questions;
      });

    scope.isAdmin = function () {
      return (Auth.getCurrentUser().role === "admin");
    }

    scope.deleteQuestion = function () {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina domanda',
          content: 'Sei sicuro di voler eliminare la domanda?'
        })
      }).result.then(function () {
        return apiClient.questions.delete(scope.question._id)
          .then(function () {
            toastr.success('Domanda eliminata!');
            $location.path('/admin');
          });
      });
    }
  });
