'use strict';

angular.module('tisostengoApp')
  .directive('specializationDropdown', function (sharedData,apiClient) {
    return {
      require: '^ngModel',
      templateUrl: 'app/directives/specializationDropdown/specializationDropdown.html',
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs, ctrl) {
        scope.model = ctrl;
        apiClient.specializations.allByCategories("choose" in attrs).then(function (res) {
          scope.specializations = res.data.specializations;
          if ("choose" in attrs) {
            if ("optional" in attrs) {
              scope.specializations.unshift({ value: 'Scegli una specializzazione', item: true });
            }
            if (!(attrs.choose)) {
              ctrl.$setViewValue("Scegli una specializzazione");
            }
            ctrl.$setValidity('required', false);

            if ("optional" in attrs) {
              ctrl.$setValidity('required', true);
            }
          }

          // Create validators
          ctrl.$validators.validDropDown = function (modelValue, viewValue) {
            /* When no value is present */
            var isValid;
            if (!modelValue || modelValue.length === 0) {
              isValid = false;
              ctrl.$setViewValue("Scegli una specializzazione");
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

          ctrl.$parsers.unshift(function (viewValue) {
            return viewValue === scope.specializations[0].value && !("choose" in attrs) ? undefined : viewValue;
          });

          if (!("choose" in attrs)) {
            ctrl.$setViewValue(scope.specializations[0].value);
          }
        });
      }
    };
  });
