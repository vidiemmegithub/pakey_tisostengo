'use strict';

angular.module('tisostengoApp')
  .directive('adminMessages', function () {
    return {
      templateUrl: 'app/directives/adminMessages/adminMessages.html',
      restrict: 'EA',
      scope: {
        messages: '=',
        resolved: '=',
        onResolveMessage: '&',
        reload: '&'
      },
      link: function (scope, element, attrs) {
        scope.filter = function (message) {
          return scope.resolved ? message.status === 'resolved' : message.status !== 'resolved';
        };
      },
      controller: function($scope, $uibModal, apiClient, toastr) {
        $scope.showDetail = function (message) {
          $uibModal.open({
            templateUrl: 'components/messageModal/messageModal.html',
            scope: angular.extend($scope.$new(), {
              title: 'Dettaglio messaggio',
              message: message
            })
          }).result.then(function () {
            return apiClient.messages.resolve(message._id)
              .then(function () {
                toastr.success('Segnalazione risolta!');
                $scope.reload();
              });
          });
        }
      }
    };
  });
