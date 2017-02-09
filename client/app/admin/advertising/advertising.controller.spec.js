'use strict';

describe('Controller: AdminAdvertisingCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var AdvertisingCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdvertisingCtrl = $controller('AdminAdvertisingCtrl', {
      $scope: scope
    });
  }));
});
