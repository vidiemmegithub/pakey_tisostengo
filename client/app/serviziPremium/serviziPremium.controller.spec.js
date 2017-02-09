'use strict';

describe('Controller: ServiziPremiumCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ServiziPremiumCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ServiziPremiumCtrl = $controller('ServiziPremiumCtrl', {
      plans: {},
      $scope: scope
    });
  }));

});
