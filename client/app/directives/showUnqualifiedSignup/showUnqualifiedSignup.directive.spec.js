'use strict';

describe('Directive: showUnqualifiedSignup', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/showUnqualifiedSignup/showUnqualifiedSignup.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

});
