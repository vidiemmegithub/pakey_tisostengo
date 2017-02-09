'use strict';

angular.module('tisostengoApp')
  .controller('AdminMessaggiInfoCtrl', function ($scope, toastr, apiClient, $uibModal) {
    var messaggi = this;

    messaggi.resolveMessage = resolveMessage;
    messaggi.loadMessagges = loadMessagges;
    
    initialize();

    function initialize() {
      loadMessagges();
    }

    function loadMessagges() {
      apiClient.messages.list({type: 'information'}).then(function (res) {
        messaggi.messages = res.data.messages;
        console.log(messaggi.messages);
      });
    }

    function resolveMessage(message) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Risolvi messaggio',
          content: 'Sei sicuro di voler segnalare messaggio come risolto?'
        })
      }).result.then(function () {
        return apiClient.messages.resolve(message._id)
          .then(function () {
            toastr.success('Messaggio risolto!');
            loadMessagges();
          });
      });
    }
  });
