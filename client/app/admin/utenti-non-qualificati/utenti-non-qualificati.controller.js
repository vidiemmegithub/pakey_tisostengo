'use strict';

angular.module('tisostengoApp')
  .controller('AdminUtentiNonQualificatiCtrl', function ($scope, toastr, apiClient, $uibModal) {
    var utenti = this;

    utenti.enableToken = enableToken;
    utenti.banUser = banUser;
    utenti.deleteUser = deleteUser;

    initialize();

    $scope.$watch("utenti.users | filterFromList:utenti.searchText", function(newVal) {
      utenti.filteredUsers = newVal;
    }, true);

    function initialize() {
      loadUsers();
    }

    function loadUsers() {
      apiClient.users.all({'role':'unqualified', 'banned':'!true', 'registrationPending':'!true'}).then(function (res) {
        utenti.users = res.data.users;
      });
    }

    function banUser(user) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Ban utente',
          content: 'Sei sicuro di voler bannare l\'utente?'
        })
      }).result.then(function () {
        return apiClient.users.ban(user._id)
          .then(function () {
            toastr.success('Utente bannato correttamente');
            loadUsers();
          });
      });
    }

    function deleteUser(user) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina utente',
          content: 'Sei sicuro di voler eliminare l\'utente? L\'operazione non è reversibile'
        })
      }).result.then(function () {
        return apiClient.users.delete(user._id)
          .then(function () {
            toastr.success('Utente eliminato!');
            loadUsers();
          });
      });
    }

    function enableToken(user) {
      return users.enablingToken && user.enablingToken !== "";
    }
  });
