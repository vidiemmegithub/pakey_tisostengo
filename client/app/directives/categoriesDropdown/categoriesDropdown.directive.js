'use strict';

angular.module('tisostengoApp')
  .directive('categoriesDropdown', function (sharedData) {
    return {
      require: '^ngModel',
      templateUrl: 'app/directives/categoriesDropdown/categoriesDropdown.html',
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs, ctrl) {
        scope.model = ctrl;

        scope.categories = sharedData.categories.all("choose" in attrs);
        if ("choose" in attrs) {
          if (!(attrs.choose)) {
            ctrl.$setViewValue("Scegli una categoria");
          }
          ctrl.$setValidity('required', false);
        }

        // Create validators
        ctrl.$validators.validDropDown = function (modelValue, viewValue) {
          /* When no value is present */
          var isValid;
          if (!modelValue || modelValue.length === 0) {
              isValid = false;
          } else {
              isValid = true;
          }
          /* Set required validator as this is not a standard html form input */
          ctrl.$setValidity('required', isValid);
          /* Set custom validators */
          ctrl.$setValidity('validDropDown', isValid);
          /* Return the model so the model is updated in the view */
          return modelValue;
        };

        ctrl.$parsers.unshift(function(viewValue) {
          return viewValue === scope.categories[0] && !("choose" in attrs) ? undefined : viewValue;
        });

        if (!("choose" in attrs)) {
          ctrl.$setViewValue(scope.categories[0]);
        }
      }
    };
  });
