'use strict';

describe('Controller: AdminMessaggiAbusiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var MessaggiAbusiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MessaggiAbusiCtrl = $controller('AdminMessaggiAbusiCtrl', {
      $scope: scope
    });
  }));
});
