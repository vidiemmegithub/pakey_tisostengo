'use strict';

describe('Filter: ellipsis', function () {

  // load the filter's module
  beforeEach(module('tisostengoApp'));

  // initialize a new instance of the filter before each test
  var ellipsis;
  beforeEach(inject(function ($filter) {
    ellipsis = $filter('ellipsis');
  }));

});
