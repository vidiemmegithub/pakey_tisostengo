'use strict';

describe('Controller: FaiUnaDomandaCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var FaiUnaDomandaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FaiUnaDomandaCtrl = $controller('FaiUnaDomandaCtrl', {
      $scope: scope
    });
  }));
});
