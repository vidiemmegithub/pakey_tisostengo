'use strict';

describe('Controller: CarepathsController', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var CarepathsController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CarepathsController = $controller('CarepathsController', {
      $scope: scope
    });
  }));
});
