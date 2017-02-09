'use strict';

describe('Controller: AdminArticoliQualificatiCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var ArticoliQualificatiCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ArticoliQualificatiCtrl = $controller('AdminArticoliQualificatiCtrl', {
      $scope: scope
    });
  }));
});
