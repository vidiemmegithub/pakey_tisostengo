'use strict';

describe('Service: apiClient', function () {

  // load the service's module
  beforeEach(module('tisostengoApp'));

  // instantiate service
  var apiClient;
  beforeEach(inject(function (_apiClient_) {
    apiClient = _apiClient_;
  }));
});
