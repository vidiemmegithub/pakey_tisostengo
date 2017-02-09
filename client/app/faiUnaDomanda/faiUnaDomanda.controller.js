'use strict';

angular.module('tisostengoApp')
  .controller('FaiUnaDomandaCtrl', function ($stateParams, apiClient, Auth, Upload, $q, $uibModal, toastr) {
    var faiUnaDomanda = this;
    var professionistaId = $stateParams.id;

    faiUnaDomanda.getCurrentUser = Auth.getCurrentUser;

    apiClient.users.get(professionistaId).then(function (res) {
      faiUnaDomanda.professionista = res.data;
    });

    faiUnaDomanda.submitQuestion = function (question) {
      question.target_user = professionistaId;

      $q.all((question.files || []).map(function (file) {
        console.log(file.type);
        if (file.type === 'application/x-ms-application' || file.type === 'application/x-msdownload' || file.type === 'application/octet-stream') {
          toastr.error('Non è possibile caricare file eseguibili');
        } else {
          return Upload.upload({
            url: '/api/upload/questions',
            file: file
          });
        }
      })).then(function (ress) {
        question.attachments = ress.map(function (res) {
          return res.data;
        });
        createQuestion(question);
      });
    };

    function createQuestion(question) {
      apiClient.questions.create(question)
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

    faiUnaDomanda.isPrivateChannel = function (user) {
      var result = false;
      if (user) {
        angular.forEach((user.subscriptions || []), function(value, key) {
          if (/^private-channel-(?=uq|unq)/.test(value.name))
            return result = value.active;
        });
      }
      return result;
    }
  });
