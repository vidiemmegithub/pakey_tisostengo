'use strict';

describe('Directive: qualifiedDetail', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/qualifiedDetail/qualifiedDetail.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));
/*
  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<qualified-detail></qualified-detail>');
    element = $compile(element)(scope);
    scope.$apply();
  }));
*/
});
