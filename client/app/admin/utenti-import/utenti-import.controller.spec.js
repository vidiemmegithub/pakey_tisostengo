'use strict';

describe('Controller: AdminUtentiImportCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var UtentiImportCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UtentiImportCtrl = $controller('AdminUtentiImportCtrl', {
      $scope: scope
    });
  }));
});
