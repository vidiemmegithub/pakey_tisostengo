'use strict';

describe('Controller: AdminCarepathsController', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var CarepathsController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CarepathsController = $controller('AdminCarepathsController', {
      $scope: scope
    });
  }));
});
