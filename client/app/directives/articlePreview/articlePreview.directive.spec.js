'use strict';

describe('Directive: articlePreview', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/articlePreview/articlePreview.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));
  /*
  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<article-preview></article-preview>');
    element = $compile(element)(scope);
    scope.$apply();
  }));
  */
});
