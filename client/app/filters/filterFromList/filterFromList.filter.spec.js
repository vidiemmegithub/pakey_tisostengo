'use strict';

describe('Filter: filterFromList', function () {

  // load the filter's module
  beforeEach(module('tisostengoApp'));

  // initialize a new instance of the filter before each test
  var filterFromList;
  beforeEach(inject(function ($filter) {
    filterFromList = $filter('filterFromList');
  }));

});
