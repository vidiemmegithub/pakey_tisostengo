'use strict';

describe('Directive: adminMessages', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/adminMessages/adminMessages.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));
});
