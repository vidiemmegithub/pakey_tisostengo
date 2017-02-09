'use strict';

describe('Controller: CercaContenutiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var CercaContenutiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CercaContenutiCtrl = $controller('CercaContenutiCtrl', {
      $scope: scope
    });
  }));
});
