'use strict';

describe('Controller: DomandaCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var DomandaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DomandaCtrl = $controller('DomandaCtrl', {
      question: {},
      $scope: scope
    });
  }));
});
