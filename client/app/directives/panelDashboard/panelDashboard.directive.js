'use strict';

angular.module('tisostengoApp')
  .directive('panelDashboard', function () {
    return {
      templateUrl: 'app/directives/panelDashboard/panelDashboard.html',
      restrict: 'E',
      scope: {
      	number: "=",
      	text: "@",
      	icon: "@",
      	color: "@",
      	link: "@"
      },
      link: function (scope, element, attrs) {
      }
    };
  });
