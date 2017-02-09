'use strict';

angular.module('tisostengoApp')
  .directive('passaPremium', function () {
    return {
      templateUrl: 'app/directives/passaPremium/passaPremium.html',
      restrict: 'EA',
      transclude: true
    };
  });
