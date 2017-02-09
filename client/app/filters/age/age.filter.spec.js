'use strict';

describe('Filter: age', function () {

  // load the filter's module
  beforeEach(module('tisostengoApp'));

  // initialize a new instance of the filter before each test
  var age;
  beforeEach(inject(function ($filter) {
    age = $filter('age');
  }));

});
