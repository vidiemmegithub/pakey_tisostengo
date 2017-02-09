'use strict';

angular.module('tisostengoApp')
  .directive('showUnqualifiedSignup', function () {
    return {
      restrict: 'A',
      scope: {
        showUnqualifiedSignup: '&'
      },
      link: function (scope, element, attrs) {
        element.on('click', function () {
          scope.showUnqualifiedSignup();
          scope.showDialog();
        })
      },
      controller: function ($scope, $state, $uibModal, Auth, $window) {
        $scope.showDialog = showDialog;

        function showDialog() {
          $uibModal.open({
            templateUrl: 'app/directives/showUnqualifiedSignup/showUnqualifiedSignup.html',
            controller: function ($scope, sharedData) {
              // ng-annotate does not recognize $uibModal yet
              // see https://github.com/olov/ng-annotate/issues/200
              "ngInject";

              $scope.cities = sharedData.cities.all();
              $scope.signup = signup;
              $scope.errors = {};

              function signup() {
                Auth.createUser($scope.user)
                  .then(function () {
                    $scope.$close();
                    $uibModal.open({
                      templateUrl: 'app/directives/showUnqualifiedSignup/unqualifiedSignupConfirmation.html'
                    });
                  })
                  .catch(function (err) {
                    $scope.errors.other = err.data.message;
                    $uibModal.open({
                      templateUrl: 'app/directives/showResetPwd/showResetPwdError.html'
                    });
                  });
              };

              $scope.loginOauth = function (provider) {
                $window.location.href = '/auth/' + provider;
              };
            }
          });
        };
      }
    };
  });
