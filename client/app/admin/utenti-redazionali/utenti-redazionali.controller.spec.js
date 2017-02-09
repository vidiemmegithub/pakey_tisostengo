'use strict';

describe('Controller: AdminUtentiRedazionaliCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var UtentiRedazionaliCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UtentiRedazionaliCtrl = $controller('AdminUtentiRedazionaliCtrl', {
      $scope: scope
    });
  }));
});
