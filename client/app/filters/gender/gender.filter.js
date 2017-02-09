'use strict';

angular.module('tisostengoApp')
  .filter('gender', function () {
    return function (gender) {
    	if (gender === 'M')
      	return 'Maschio';
      else if (gender === 'F')
      	return 'Femmina';
      else
      	return 'Non specifico';
    };
  });
