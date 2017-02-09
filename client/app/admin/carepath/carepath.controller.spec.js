'use strict';

describe('Controller: AdminCarepathCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var AdminCarepathCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminCarepathCtrl = $controller('AdminCarepathCtrl', {
      $scope: scope
    });
  }));

});
