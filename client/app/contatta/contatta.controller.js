'use strict';

angular.module('tisostengoApp')
  .controller('ContattaCtrl', function ($scope, $stateParams, $location, Auth, apiClient, $uibModal) {
    var scope = this;

    scope.message = {};

    $scope.getCurrentUser = Auth.getCurrentUser;

    scope.motivations = [
    	{
    		text: 'Richiedi informazioni',
    		id: 'information'
    	},
    	{
    		text: 'Richiedi assistenza tecnica',
    		id: 'technical'
    	},
    	{
    		text: 'Segnala un abuso',
    		id: 'abuse'
    	}
    ];

    if ($stateParams.type) {
    	scope.message.type = scope.motivations[2].id;
    	scope.message.url = $location.absUrl().replace($location.url(), '') + '/' + $stateParams.type + '/' + $stateParams.id;
    } else {
    	scope.message.type = scope.motivations[0].id;
    }

    $scope.$watch('getCurrentUser().firstname', function () {
    	scope.message.firstname = $scope.getCurrentUser().firstname;
    	scope.message.lastname = $scope.getCurrentUser().lastname;
    	scope.message.email = $scope.getCurrentUser().email;
    });

    scope.send = function (message) {
        apiClient.messages.create(message)
            .then( function () {
                openModal(true);
            }, function () {
                openModal(false);
            });
    };

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
  });
