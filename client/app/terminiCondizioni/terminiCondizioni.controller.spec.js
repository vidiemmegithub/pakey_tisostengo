'use strict';

describe('Controller: TerminiCondizioniCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var TerminiCondizioniCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TerminiCondizioniCtrl = $controller('TerminiCondizioniCtrl', {
      $scope: scope
    });
  }));

});
