'use strict';

angular.module('tisostengoApp')
  .directive('userTypesDropdown', function () {
    return {
      require: '^ngModel',
      templateUrl: 'app/directives/userTypesDropdown/userTypesDropdown.html',
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs, ctrl) {
        scope.model = ctrl;

        scope.userTypes = ['Redattori e professionisti', 'Redattori', 'Professionisti'];

        ctrl.$parsers.unshift(function(viewValue) {
          switch (viewValue) {
            case scope.userTypes[1]:
              return true;
              break;
            case scope.userTypes[2]:
              return false;
              break;
            default:
              return undefined;
          }
          //return viewValue === scope.userTypes[0] ? undefined : viewValue;
        });

        ctrl.$setViewValue(scope.userTypes[0]);
      }
    };
  });
