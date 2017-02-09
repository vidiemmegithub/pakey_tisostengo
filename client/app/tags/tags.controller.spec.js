'use strict';

describe('Controller: TagsCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var TagsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TagsCtrl = $controller('TagsCtrl', {
      $scope: scope
    });
  }));

});
