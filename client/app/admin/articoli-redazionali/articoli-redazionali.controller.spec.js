'use strict';

describe('Controller: AdminArticoliRedazionaliCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ArticoliRedazionaliCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ArticoliRedazionaliCtrl = $controller('AdminArticoliRedazionaliCtrl', {
      $scope: scope
    });
  }));
});
