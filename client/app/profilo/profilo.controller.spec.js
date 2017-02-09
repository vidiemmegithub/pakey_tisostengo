'use strict';

describe('Controller: ProfiloCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ProfiloCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfiloCtrl = $controller('ProfiloCtrl', {
      currentUser: {},
      $scope: scope
    });
  }));

});
