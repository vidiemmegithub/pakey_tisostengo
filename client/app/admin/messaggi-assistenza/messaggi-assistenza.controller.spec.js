'use strict';

describe('Controller: AdminMessaggiAssistenzaCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var MessaggiAssistenzaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MessaggiAssistenzaCtrl = $controller('AdminMessaggiAssistenzaCtrl', {
      $scope: scope
    });
  }));
});
