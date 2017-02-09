'use strict';

describe('Directive: questionPreview', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/questionPreview/questionPreview.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));
});
