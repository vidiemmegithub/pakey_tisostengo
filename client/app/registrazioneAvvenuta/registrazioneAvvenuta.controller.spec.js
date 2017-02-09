'use strict';

describe('Controller: RegistrazioneAvvenutaCtrl', function () {

  // load the controller's module
  beforeEach(module('tisostengoApp'));

  var RegistrazioneAvvenutaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RegistrazioneAvvenutaCtrl = $controller('RegistrazioneAvvenutaCtrl', {
      $scope: scope
    });
  }));

});
