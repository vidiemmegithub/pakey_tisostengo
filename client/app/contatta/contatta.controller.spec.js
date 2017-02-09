'use strict';

describe('Controller: ContattaCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ContattaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContattaCtrl = $controller('ContattaCtrl', {
      $scope: scope
    });
  }));
});
