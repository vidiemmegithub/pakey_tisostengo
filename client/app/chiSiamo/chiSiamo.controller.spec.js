'use strict';

describe('Controller: ChiSiamoCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ChiSiamoCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChiSiamoCtrl = $controller('ChiSiamoCtrl', {
      $scope: scope
    });
  }));
});
