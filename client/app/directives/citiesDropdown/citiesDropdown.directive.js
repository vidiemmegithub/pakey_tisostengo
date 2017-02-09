'use strict';

angular.module('tisostengoApp')
  .directive('citiesDropdown', function (sharedData) {
    return {
      require: '^ngModel',
      templateUrl: 'app/directives/citiesDropdown/citiesDropdown.html',
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs, ctrl) {
        scope.model = ctrl;

        scope.cities = ['Tutte le province'].concat(sharedData.cities.all());

        ctrl.$parsers.unshift(function (viewValue) {
          return viewValue === scope.cities[0] ? undefined : viewValue;
        });

        ctrl.$setViewValue(scope.cities[0]);
      }
    };
  });
