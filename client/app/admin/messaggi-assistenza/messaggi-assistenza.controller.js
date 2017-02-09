'use strict';

angular.module('tisostengoApp')
  .controller('AdminMessaggiAssistenzaCtrl', function ($scope, toastr, apiClient, $uibModal) {
    var messaggi = this;

    messaggi.resolveMessage = resolveMessage;
    messaggi.loadMessagges = loadMessagges;
    
    initialize();

    function initialize() {
      loadMessagges();
    }

    function loadMessagges() {
      apiClient.messages.list({type: 'technical'}).then(function (res) {
        messaggi.messages = res.data.messages;
        console.log(messaggi.messages);
      });
    }

    function resolveMessage(message) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Risolvi richiesta di assistenza',
          content: 'Sei sicuro di voler segnalare questo richiesta di assistenza come risolta?'
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
