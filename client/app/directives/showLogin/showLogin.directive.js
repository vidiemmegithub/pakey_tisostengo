'use strict';

angular.module('tisostengoApp')
  .directive('showLogin', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('click', function () {
          scope.showLoginDialog();
        })
      },
      controller: function ($scope, $location, $state, $uibModal) {
        $scope.showLoginDialog = function () {
          $uibModal.open({
              templateUrl: 'app/directives/showLogin/showLogin.html',
              controller: function ($scope, Auth, $location, $window) {
                // ng-annotate does not recognize $uibModal yet
                // see https://github.com/olov/ng-annotate/issues/200
                "ngInject";

                $scope.user = {};
                $scope.errors = {};

                $scope.login = function (form) {
                  $scope.submitted = true;

                  if (form.$valid) {
                    Auth.login({
                        email: $scope.user.email,
                        password: $scope.user.password
                      })
                      .then(function () {
                        $scope.$close();
                      })
                      .catch(function (err) {
                        $scope.errors.other = err.message;
                      });
                  }
                };

                $scope.loginOauth = function (provider) {
                  $window.location.href = '/auth/' + provider;
                };
              }
            })
            .result.then(function (reason) {
            if (!reason)
              $state.reload();
          });
        };
      }
    }
  });
