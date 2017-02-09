'use strict';

describe('Controller: MieiArticoliCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var MieiArticoliCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MieiArticoliCtrl = $controller('MieiArticoliCtrl', {
      $scope: scope
    });
  }));

});
