'use strict';

describe('Controller: AdminUtentiNonQualificatiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var UtentiNonQualificatiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UtentiNonQualificatiCtrl = $controller('AdminUtentiNonQualificatiCtrl', {
      $scope: scope
    });
  }));
});
