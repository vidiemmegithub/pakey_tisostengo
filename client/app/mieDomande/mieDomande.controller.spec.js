'use strict';

describe('Controller: MieDomandeCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var MieDomandeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MieDomandeCtrl = $controller('MieDomandeCtrl', {
      $scope: scope
    });
  }));

});
