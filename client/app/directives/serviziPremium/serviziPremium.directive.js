'use strict';

angular.module('tisostengoApp')
  .directive('serviziPremium', function () {
    return {
      templateUrl: 'app/directives/serviziPremium/serviziPremium.html',
      restrict: 'EA',
      scope: {
      	subscriptions: '='
      },
      link: function (scope, element, attrs) {

      },
      controller: function ($scope, apiClient, toastr, $uibModal, $filter) {
      	$scope.removeService = function (service, index) {
		      $uibModal.open({
		        templateUrl: 'components/promptModal/promptModal.html',
		        scope: angular.extend($scope.$new(), {
		          title: 'Disattiva servizio',
		          content: 'Hai scelto di disattivare il servizio ' + $scope.describeService(service.name) + '. Sei sicuro di volerlo disattivare?'
		        })
		      }).result.then(function () {
		        return apiClient.payments.unsubscribe(service.name)
		          .then(function (res) {
		          	$scope.subscriptions.splice(index, 1, res.data.subscription);
		            toastr.success('Il servizio premium è stato disattivato. Sarà disponibile fino al ' + $filter('date')(res.data.subscription.deactivation_date) + '. Potrai riattivarlo in qualsiasi momento!');
		          }, function (fail) {
		            toastr.error('Impossibile rimuovere il servizio selezionato');
		          });
		      });
    		}

    		$scope.describeService = function (service) {
		      return {
		        'profile-pro': 'PERSONALIZZAZIONE DEL PROFILO',
		        'ranking': 'INDICIZZAZIONE',
		        'private-channel-unq': 'CANALE PRIVATO',
		        'private-channel-uq': 'CANALE PRIVATO'
		      }[service];
		    }
      }
    };
  });
