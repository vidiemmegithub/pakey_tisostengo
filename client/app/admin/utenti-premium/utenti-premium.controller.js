'use strict';

angular.module('tisostengoApp')
  .controller('AdminUtentiPremiumCtrl', function ($scope, apiClient, $uibModal, toastr) {
    var utenti = this;

    utenti.removeService = removeService;

    initialize();

    $scope.$watch("utenti.users | filterFromList:utenti.searchText", function(newVal) {
      utenti.filteredUsers = newVal;
    }, true);

    function initialize() {
      loadUsers();
    }

    function loadUsers() {
      apiClient.users.all({'subscriptions.name':['private-channel-uq', 'private-channel-unq', 'ranking', 'profile-pro']}).then(function (res) {
        utenti.users = res.data.users;
      });
    }

    function removeService(user, service) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Disattiva servizio',
          content: 'Hai scelto di disattivare il servizio ' + describeService(service) + '. Sei sicuro di volerlo disattivare?'
        })
      }).result.then(function () {
        return apiClient.payments.unsubscribe(service, user._id)
          .then(function () {
            toastr.success('Il servizio premium è stato disattivato. Potrai riattivarlo in qualsiasi momento!');
            loadUsers();
          }, function (fail) {
            toastr.error('Impossibile rimuovere il servizio selezionato');
          });
      });
    }

    function describeService(service) {
      return {
        'profile-pro': 'PERSONALIZZAZIONE DEL PROFILO',
        'ranking': 'INDICIZZAZIONE',
        'private-channel-unq': 'CANALE PRIVATO',
        'private-channel-uq': 'CANALE PRIVATO'
      }[service];
    }
  });
