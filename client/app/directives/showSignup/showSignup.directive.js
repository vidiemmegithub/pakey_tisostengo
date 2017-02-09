'use strict';

angular.module('tisostengoApp')
  .directive('showSignup', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('click', function () {
          scope.showSignupDialog();
        });
      },
      controller: function ($scope, $uibModal, $location) {
        $scope.showSignupDialog = showSignupDialog;

        function showSignupDialog() {
          $uibModal.open({
            templateUrl: 'app/directives/showSignup/showSignup.html'
          }).result.catch(function (reason) {
            switch (reason) {
              case 'registerQualified':
                return $location.path('/registra-professionista');
            }
          });
        }
      }
    };
  });
