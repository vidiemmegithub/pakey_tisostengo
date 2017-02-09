'use strict';

describe('Controller: RiepilogoPremiumCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var RiepilogoPremiumCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RiepilogoPremiumCtrl = $controller('RiepilogoPremiumCtrl', {
      serviceType: {},
      $scope: scope
    });
  }));

});
