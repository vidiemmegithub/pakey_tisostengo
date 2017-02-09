'use strict';

describe('Filter: gender', function () {

  // load the filter's module
  beforeEach(module('tisostengoApp'));

  // initialize a new instance of the filter before each test
  var gender;
  beforeEach(inject(function ($filter) {
    gender = $filter('gender');
  }));

});
