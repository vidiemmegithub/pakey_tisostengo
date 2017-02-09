'use strict';

describe('Controller: CercaProfessionistiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var CercaProfessionistiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CercaProfessionistiCtrl = $controller('CercaProfessionistiCtrl', {
      $scope: scope
    });
  }));
});
