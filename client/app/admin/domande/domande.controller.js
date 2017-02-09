'use strict';

angular.module('tisostengoApp')
  .controller('AdminDomandeCtrl', function ($scope, toastr, apiClient, $uibModal) {
    var domande = this;

    domande.delete = deleteQuestion;

    initialize();

    $scope.$watch("domande.questions | filterFromList:domande.searchText", function(newVal) {
      domande.filteredQuestions = newVal;
    }, true);

    function initialize() {
      loadQuestions();
    }

    function loadQuestions() {
      apiClient.questions.all().then(function (res) {
        domande.questions = res.data.questions;
      });
    }

    function deleteQuestion(question) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina domanda',
          content: 'Sei sicuro di voler eliminare la domanda? L\'operazione non è reversibile'
        })
      }).result.then(function () {
        return apiClient.questions.delete(question._id)
          .then(function () {
            toastr.success('Domanda eliminata!');
            loadQuestions();
          });
      });
    }
  });
