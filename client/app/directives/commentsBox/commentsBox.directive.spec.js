'use strict';

describe('Directive: commentsBox', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/commentsBox/commentsBox.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));
});
