'use strict';

angular.module('tisostengoApp')
  .directive('bsHasError', function () {
    return {
      require: ['ngModel', '^form'],
      restrict: 'A',
      link: function (scope, element, atts, ctrls) {
        scope.$on('$destroy', scope.$watch(function () {
          return ctrls[0].$invalid;
        }, function (isInvalid) {
          element.parents('.form-group').first().toggleClass('has-error', isInvalid);
        }));
      }
    };
  });
