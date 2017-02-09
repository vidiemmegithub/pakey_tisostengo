'use strict';

describe('Controller: AdminUtentiBannatiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var UtentiBannatiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UtentiBannatiCtrl = $controller('AdminUtentiBannatiCtrl', {
      $scope: scope
    });
  }));
});
