'use strict';

describe('Controller: DomandeInArrivoCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var DomandeInArrivoCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DomandeInArrivoCtrl = $controller('DomandeInArrivoCtrl', {
      $scope: scope
    });
  }));
});
