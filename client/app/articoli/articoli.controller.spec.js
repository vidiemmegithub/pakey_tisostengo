'use strict';

describe('Controller: ArticoliCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ArticoliCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ArticoliCtrl = $controller('ArticoliCtrl', {
      $scope: scope
    });
  }));
});
