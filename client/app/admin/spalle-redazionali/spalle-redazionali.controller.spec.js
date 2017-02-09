'use strict';

describe('Controller: AdminSpalleRedazionaliCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var AdminSpalleRedazionaliCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminSpalleRedazionaliCtrl = $controller('AdminSpalleRedazionaliCtrl', {
      $scope: scope
    });
  }));
});
