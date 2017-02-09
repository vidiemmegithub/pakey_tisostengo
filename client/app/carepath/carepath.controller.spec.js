'use strict';

describe('Controller: CarepathController', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var CarepathController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CarepathController = $controller('CarepathController', {
      $scope: scope
    });
  }));
});
