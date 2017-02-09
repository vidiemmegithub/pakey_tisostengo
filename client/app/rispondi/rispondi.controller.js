'use strict';

angular.module('tisostengoApp')
  .controller('RispondiCtrl', function ($scope, $stateParams, apiClient, $uibModal) {
    var scope = this;

    apiClient.questions.get($stateParams.id, {}, [])
      .then(function (res) {
        scope.question = res.data;
      });

    scope.submitAnswer = function (answer) {
    	createAnswer(answer);
    }

    function createAnswer(answer) {
      apiClient.questions.answer($stateParams.id, answer)
        .then(function(result) {
            openModale(true);
          }, function(fail) {
            openModale(false);
          });
    }

    function openModale(isOk) {
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
        backdrop : 'static'
      });
    }
  });
