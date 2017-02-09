'use strict';

angular.module('tisostengoApp')
  .directive('showResetPwd', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
      	element.on('click', function () {
          scope.showResetPwdDialog();
        });
      },
      controller: function ($scope, $location, $state, $uibModal) {
      	$scope.showResetPwdDialog = showResetPwdDialog;

        function showResetPwdDialog () {
          $uibModal.open({
              templateUrl: 'app/directives/showResetPwd/showResetPwd.html',
              controller: function ($scope, apiClient, sharedData) {
                // ng-annotate does not recognize $uibModal yet
                // see https://github.com/olov/ng-annotate/issues/200
                "ngInject";

                $scope.cities = sharedData.cities.all();
                $scope.errors = {};

                $scope.reset = function (form) {
                  $scope.submitted = true;

                  if (form.$valid) {
                    apiClient.users.resetPassword($scope.email, $scope.province)
                      .then(function () {
                        $scope.$close();
                        $uibModal.open({
						        			templateUrl: 'app/directives/showResetPwd/showResetPwdOk.html'
						        		});
                      }, function (error) {
                      	$scope.errors.other = error.data.message;
                      	$uibModal.open({
						        			templateUrl: 'app/directives/showResetPwd/showResetPwdError.html'
						        		});
                      });
                  }
                };

              }
            })
            .result.then(function (reason) {
            if (!reason)
              $state.reload();
          });
        };
      }
    };
  });
