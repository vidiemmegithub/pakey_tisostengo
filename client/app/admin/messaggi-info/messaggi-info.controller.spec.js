'use strict';

describe('Controller: AdminMessaggiInfoCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var MessaggiInfoCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MessaggiInfoCtrl = $controller('AdminMessaggiInfoCtrl', {
      $scope: scope
    });
  }));
});
