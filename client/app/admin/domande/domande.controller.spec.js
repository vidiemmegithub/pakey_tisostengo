'use strict';

describe('Controller: AdminDomandeCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var DomandeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DomandeCtrl = $controller('AdminDomandeCtrl', {
      $scope: scope
    });
  }));
});
