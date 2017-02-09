'use strict';

describe('Directive: serviziPremium', function () {

  // load the directive's module and view
  beforeEach(module('tisostengoApp'));
  beforeEach(module('app/directives/serviziPremium/serviziPremium.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<servizi-premium></servizi-premium>');
    element = $compile(element)(scope);
    scope.$apply();
  }));
});
