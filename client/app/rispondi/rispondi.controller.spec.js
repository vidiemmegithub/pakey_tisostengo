'use strict';

describe('Controller: RispondiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var RispondiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RispondiCtrl = $controller('RispondiCtrl', {
      $scope: scope
    });
  }));

});
