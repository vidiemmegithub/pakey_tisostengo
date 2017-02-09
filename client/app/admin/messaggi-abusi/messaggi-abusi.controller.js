'use strict';

angular.module('tisostengoApp')
  .controller('AdminMessaggiAbusiCtrl', function ($scope, toastr, apiClient, $uibModal) {
    var messaggi = this;

    messaggi.resolveMessage = resolveMessage;
    messaggi.loadMessagges = loadMessagges;

    initialize();

    function initialize() {
      loadMessagges();
    }

    function loadMessagges() {
      apiClient.messages.list({type: 'abuse'}).then(function (res) {
        messaggi.messages = res.data.messages;
        console.log(messaggi.messages);
      });
    }

    function resolveMessage(message) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Risolvi abuso',
          content: 'Sei sicuro di voler segnalare questo abuso come risolto?'
        })
      }).result.then(function () {
        return apiClient.messages.resolve(message._id)
          .then(function () {
            toastr.success('Abuso risolto!');
            loadMessagges();
          });
      });
    }
  });
