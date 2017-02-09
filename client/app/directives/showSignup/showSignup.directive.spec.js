'use strict';

describe('Directive: showSignup', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/showSignup/showSignup.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

});
