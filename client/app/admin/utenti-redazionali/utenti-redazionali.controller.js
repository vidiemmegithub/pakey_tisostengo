'use strict';

angular.module('tisostengoApp')
  .controller('AdminUtentiRedazionaliCtrl', function ($scope, toastr, apiClient, $uibModal) {
    var utenti = this;

    utenti.banUser = banUser;
    utenti.deleteUser = deleteUser;
    utenti.createEditor = createEditor;

    initialize();

    $scope.$watch("utenti.users | filterFromList:utenti.searchText", function(newVal) {
      utenti.filteredUsers = newVal;
    }, true);

    function initialize() {
      loadUsers();
    }

    function loadUsers() {
      apiClient.users.all({'role':'editor', 'banned':'!true'}).then(function (res) {
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
            toastr.success('Utente eliminato');
            loadUsers();
          });
      });
    }

    function createEditor() {
      $uibModal.open({
        templateUrl: 'createEditor.html',
        controller: function ($scope, Auth) {
          // ng-annotate does not recognize $uibModal yet
          // see https://github.com/olov/ng-annotate/issues/200
          "ngInject";

          $scope.create = create;
          $scope.errors = {};

          function create() {
            $scope.user.role = 'editor';
            Auth.createUser($scope.user)
              .then(function () {
                $scope.$close();
                toastr.success('Utente creato con successo!');
                loadUsers();
              })
              .catch(function (err) {
                $scope.errors.other = err.data.message;
                toastr.error('Si è verificato un problema, utente non creato');
              });
          };
        }
      });
    };

  });
