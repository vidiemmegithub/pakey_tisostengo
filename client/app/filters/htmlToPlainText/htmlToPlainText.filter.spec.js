'use strict';

describe('Filter: htmlToPlainText', function () {

  // load the filter's module
  beforeEach(module('tisostengoApp'));

  // initialize a new instance of the filter before each test
  var htmlToPlainText;
  beforeEach(inject(function ($filter) {
    htmlToPlainText = $filter('htmlToPlainText');
  }));

});
