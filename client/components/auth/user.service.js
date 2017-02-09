'use strict';

angular.module('tisostengoApp')
  .factory('User', function ($resource, $http) {
    return $resource('/api/users/:id/:controller', {
        id: '@_id'
      },
      {
        changePassword: {
          method: 'PUT',
          params: {
            controller: 'password'
          }
        },
        get: {
          method: 'GET',
          params: {
            id: 'me'
          },
          transformResponse: appendTransform($http.defaults.transformResponse, function (value) {
            if (value.dateOfBirth) {
              value.dateOfBirth = new Date(value.dateOfBirth);
            }
            return value;
          })
        }
      });

    function appendTransform(defaults, transform) {

      // We can't guarantee that the default transformation is an array
      defaults = angular.isArray(defaults) ? defaults : [defaults];

      // Append the new transformation to the defaults
      return defaults.concat(transform);
    }
  });
