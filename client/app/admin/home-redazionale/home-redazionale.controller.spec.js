'use strict';

describe('Controller: AdminHomeRedazionaleCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var HomeRedazionaleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HomeRedazionaleCtrl = $controller('AdminHomeRedazionaleCtrl', {
      $scope: scope
    });
  }));
});
