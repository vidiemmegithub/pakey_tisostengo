'use strict';

describe('Controller: ProfessionistiSeguitiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ProfessionistiSeguitiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfessionistiSeguitiCtrl = $controller('ProfessionistiSeguitiCtrl', {
      $scope: scope
    });
  }));

});
