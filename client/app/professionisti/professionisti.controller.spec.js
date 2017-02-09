'use strict';

describe('Controller: ProfessionistiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ProfessionistiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfessionistiCtrl = $controller('ProfessionistiCtrl', {
      $scope: scope
    });
  }));

});
