'use strict';

describe('Controller: ProfessionistaCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ProfessionistaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfessionistaCtrl = $controller('ProfessionistaCtrl', {
      user: {},
      $scope: scope
    });
  }));

});
