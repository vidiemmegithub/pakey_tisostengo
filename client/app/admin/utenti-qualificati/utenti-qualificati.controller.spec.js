'use strict';

describe('Controller: AdminUtentiQualificatiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var UtentiQualificatiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UtentiQualificatiCtrl = $controller('AdminUtentiQualificatiCtrl', {
      $scope: scope
    });
  }));
});
