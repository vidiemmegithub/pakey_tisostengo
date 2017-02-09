'use strict';

angular.module('tisostengoApp')
  .controller('AdminUtentiBannatiCtrl', function ($scope, apiClient, toastr, $uibModal) {
    var utenti = this;

    utenti.removeBan = removeBan;
    utenti.deleteUser = deleteUser;
    utenti.banned = banned;

    initialize();

    $scope.$watch("utenti.users | filterFromList:utenti.searchText", function(newVal) {
      utenti.filteredUsers = newVal;
    }, true);

    function initialize() {
      loadUsers();
    }

    function loadUsers() {
      apiClient.users.all({'banned':'true'}).then(function (res) {
        utenti.users = res.data.users;
      });
    }

    function removeBan(user) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Riattivazione utente',
          content: 'Sei sicuro di voler riattivare l\'utente?'
        })
      }).result.then(function () {
        return apiClient.users.removeBan(user._id)
          .then(function () {
            toastr.success('Utente riattivato correttamente');
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

    function banned(user) {
      return user.banned;
    }

    /*
    function describeRole(role) {
      return {
        unqualified: 'Non qualificato',
        qualified: 'Qualificato',
        editor: 'Editor',
        admin: 'Amministratore'
      }[role];
    }
    */
  });
