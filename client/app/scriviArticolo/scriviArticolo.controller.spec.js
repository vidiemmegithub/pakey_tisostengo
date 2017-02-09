'use strict';

describe('Controller: ScriviArticoloCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ScriviArticoloCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScriviArticoloCtrl = $controller('ScriviArticoloCtrl', {
      $scope: scope,
      article: null
    });
  }));

});
