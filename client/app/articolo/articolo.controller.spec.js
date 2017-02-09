'use strict';

describe('Controller: ArticoloCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ArticoloCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ArticoloCtrl = $controller('ArticoloCtrl', {
      article: {},
      $scope: scope
    });
  }));
});
