'use strict';

describe('Controller: AdminUtentiPremiumCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var UtentiPremiumCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UtentiPremiumCtrl = $controller('AdminUtentiPremiumCtrl', {
      $scope: scope
    });
  }));
});
