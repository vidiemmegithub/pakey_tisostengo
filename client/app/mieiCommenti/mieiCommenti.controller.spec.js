'use strict';

describe('Controller: MieiCommentiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var MieiCommentiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MieiCommentiCtrl = $controller('MieiCommentiCtrl', {
      $scope: scope
    });
  }));

});
