'use strict';

angular.module('tisostengoApp')
  .directive('adminUsers', function () {
    return {
      templateUrl: 'app/directives/adminUsers/adminUsers.html',
      restrict: 'EA',
      scope: {
        users: '=',
        role: "=",
        customFilter: "&",
        onActivateUser: '&',
        onDeleteUser: '&',
        onBanUser: '&',
        onRemoveBanUser: '&'
      },
      link: function (scope, element, attrs) {
        scope.filter = function (user) {
          return scope.customFilter({ user: user });
        };

        scope.removeBan = 'onRemoveBanUser' in attrs;
        scope.ban = 'onBanUser' in attrs;
        scope.delete = 'onDeleteUser' in attrs;
        scope.activate = 'onActivateUser' in attrs;
      }
    };
  });