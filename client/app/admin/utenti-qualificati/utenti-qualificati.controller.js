'use strict';

angular.module('tisostengoApp')
  .controller('AdminUtentiQualificatiCtrl', function ($scope, toastr, apiClient, $uibModal) {
    var scope = this;

    scope.queryFilter1 = {'role':['qualified'], 'banned':'!true', 'registrationPending':'!true'};
    scope.queryFilter2 = {'role':['qualified'], 'banned':'!true', 'registrationPending':'true'};
    scope.keysearch = '';
    scope.tab = 1;
    scope.queryFilter = scope.queryFilter1;

    scope.selectTab1 = function() {
      scope.queryFilter = scope.queryFilter1;
      scope.tab = 1;
      initialize();
    };

    scope.selectTab2 = function() {
      scope.queryFilter = scope.queryFilter2;
      scope.tab = 2;
      initialize();
    };

    scope.selectTab3 = function() {
      scope.queryFilter = scope.queryFilter2;
      scope.tab = 3;
      initialize();
    };

    scope.applyFilter = function(filter) {
      scope.keysearch = filter;
      initialize();
    };

    scope.applyFilter2 = function(user) {
      if(scope.tab==2) qualifiedToApprove({ user: user });
      if(scope.tab==3) qualifiedInactive({ user: user });
    };

    scope.loadMore = function() {
      scope.currentPage++;
      load();
    };

    initialize();

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.users = [];

      load();
    }

    function load() {
      scope.isLoading = true;

      apiClient.users
        .list(scope.queryFilter, [], scope.pageSize, scope.currentPage, scope.keysearch)
        .then(function (res) {
          if (res.data.users && res.data.users.length > 0) {
            scope.users.push.apply(scope.users, res.data.users);
            scope.noMore = false;
          } else {
            scope.noMore = true;
          }
        })
        .finally(function () {
          scope.isLoading = false;
        });
    }

    scope.activateUser = function(user) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Attivazione utente',
          content: 'Sei sicuro di voler attivare l\'utente?'
        })
      }).result.then(function () {
        return apiClient.users.validateRegistration(user)
          .then(function () {
            toastr.success('Utente attivato correttamente');
            initialize();
          });
      });
    }

    scope.banUser = function(user) {
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
            initialize();
          });
      });
    }

    scope.removeBanUser = function(user) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Ban utente',
          content: 'Sei sicuro di voler rimuovere il ban all\'utente?'
        })
      }).result.then(function () {
        return apiClient.users.removeBan(user._id)
          .then(function () {
            toastr.success('Ban eliminato');
            initialize();
          });
      });
    }

    scope.deleteUser = function(user) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina utente',
          content: 'Sei sicuro di voler eliminare l\'utente? L\'operazione non è reversibile'
        })
      }).result.then(function () {
        return apiClient.users.delete(user._id)
          .then(function(){
            toastr.success('Utente eliminato!');
            initialize();
          });
      });
    }

    function registrationPending(user) {
      return user.registrationPending === true;
    }

    function enableToken(user) {
      return user.enablingToken && user.enablingToken !== "";
    }

    function qualifiedInactive(user) {
      return enableToken(user) && registrationPending(user);
    }

    function qualifiedToApprove(user) {
      return !enableToken(user) && registrationPending(user);
    }
  });
